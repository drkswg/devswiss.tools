import { z } from 'zod';

import { formatFieldErrors } from '@/lib/validation/common';

export const cronFieldCounts = ['5', '6'] as const;
export type CronFieldCount = (typeof cronFieldCounts)[number];
export const cronFieldKeys = ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'] as const;
export type CronFieldKey = (typeof cronFieldKeys)[number];

export type CronDraft = { fieldCount: CronFieldCount } & Record<CronFieldKey, string>;

type CronFieldRange = {
  label: string;
  max: number;
  min: number;
};

type CronOption = {
  label: string;
  value: string;
};

const fieldRanges: Record<CronFieldKey, CronFieldRange> = {
  seconds: { label: 'Seconds', min: 0, max: 59 },
  minutes: { label: 'Minutes', min: 0, max: 59 },
  hours: { label: 'Hours', min: 0, max: 23 },
  dayOfMonth: { label: 'Day of month', min: 1, max: 31 },
  month: { label: 'Month', min: 1, max: 12 },
  dayOfWeek: { label: 'Day of week', min: 0, max: 7 }
};

export const emptyCronDraft: CronDraft = {
  fieldCount: '6',
  seconds: '',
  minutes: '',
  hours: '',
  dayOfMonth: '',
  month: '',
  dayOfWeek: ''
};

export const cronFieldOptions: Record<CronFieldKey, readonly CronOption[]> = {
  seconds: [
    { value: '*', label: 'Any second (*)' },
    { value: '0', label: 'Second 0' },
    { value: '*/5', label: 'Every 5 seconds (*/5)' },
    { value: '*/10', label: 'Every 10 seconds (*/10)' },
    { value: '*/15', label: 'Every 15 seconds (*/15)' },
    { value: '*/30', label: 'Every 30 seconds (*/30)' }
  ],
  minutes: [
    { value: '*', label: 'Any minute (*)' },
    { value: '0', label: 'Minute 0' },
    { value: '*/5', label: 'Every 5 minutes (*/5)' },
    { value: '*/10', label: 'Every 10 minutes (*/10)' },
    { value: '*/15', label: 'Every 15 minutes (*/15)' },
    { value: '*/30', label: 'Every 30 minutes (*/30)' }
  ],
  hours: [
    { value: '*', label: 'Any hour (*)' },
    { value: '0', label: '00:00 hour' },
    { value: '9', label: '09:00 hour' },
    { value: '12', label: '12:00 hour' },
    { value: '18', label: '18:00 hour' },
    { value: '*/2', label: 'Every 2 hours (*/2)' },
    { value: '9-17', label: 'Business hours range (9-17)' }
  ],
  dayOfMonth: [
    { value: '*', label: 'Any day of month (*)' },
    { value: '1', label: 'Day 1' },
    { value: '15', label: 'Day 15' },
    { value: '28', label: 'Day 28' },
    { value: '1-5', label: 'Days 1-5' }
  ],
  month: [
    { value: '*', label: 'Any month (*)' },
    { value: '1', label: 'January (1)' },
    { value: '3', label: 'March (3)' },
    { value: '6', label: 'June (6)' },
    { value: '9', label: 'September (9)' },
    { value: '12', label: 'December (12)' }
  ],
  dayOfWeek: [
    { value: '*', label: 'Any day of week (*)' },
    { value: '1-5', label: 'Monday-Friday (1-5)' },
    { value: '1', label: 'Monday (1)' },
    { value: '5', label: 'Friday (5)' },
    { value: '0,6', label: 'Weekend (0,6)' }
  ]
};

function parseNumber(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number.parseInt(value, 10);
}

function inRange(value: number, range: CronFieldRange) {
  return value >= range.min && value <= range.max;
}

function validateSegment(segment: string, range: CronFieldRange) {
  if (segment.length === 0) {
    return false;
  }

  const stepMatch = /^\*\/(\d+)$/.exec(segment);
  if (stepMatch) {
    const step = parseNumber(stepMatch[1]);
    if (step === null) {
      return false;
    }

    const span = range.max - range.min + 1;
    return step > 0 && step <= span;
  }

  const rangeMatch = /^(\d+)-(\d+)$/.exec(segment);
  if (rangeMatch) {
    const start = parseNumber(rangeMatch[1]);
    const end = parseNumber(rangeMatch[2]);
    if (start === null || end === null) {
      return false;
    }

    return inRange(start, range) && inRange(end, range) && start <= end;
  }

  const number = parseNumber(segment);
  return number !== null && inRange(number, range);
}

export function isValidCronFieldValue(value: string, field: CronFieldKey) {
  const normalized = value.trim();
  if (normalized === '*') {
    return true;
  }

  const range = fieldRanges[field];
  const segments = normalized.split(',').map((segment) => segment.trim());
  return segments.every((segment) => validateSegment(segment, range));
}

function fieldSchema(field: CronFieldKey) {
  const range = fieldRanges[field];
  return z
    .string()
    .trim()
    .min(1, `${range.label} is required.`)
    .refine((value) => isValidCronFieldValue(value, field), {
      message: `${range.label} value is invalid for this cron field.`
    });
}

function optionalFieldSchema(field: CronFieldKey) {
  const range = fieldRanges[field];
  return z
    .string()
    .trim()
    .refine((value) => value.length === 0 || isValidCronFieldValue(value, field), {
      message: `${range.label} value is invalid for this cron field.`
    });
}

export const cronDraftSchema = z
  .object({
    fieldCount: z.enum(cronFieldCounts),
    seconds: optionalFieldSchema('seconds'),
    minutes: fieldSchema('minutes'),
    hours: fieldSchema('hours'),
    dayOfMonth: fieldSchema('dayOfMonth'),
    month: fieldSchema('month'),
    dayOfWeek: fieldSchema('dayOfWeek')
  })
  .superRefine((value, context) => {
    if (value.fieldCount === '6' && value.seconds.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['seconds'],
        message: 'Seconds is required.'
      });
    }

    if (value.dayOfMonth === '*' || value.dayOfWeek === '*') {
      return;
    }

    const message =
      'Choose either day of month or day of week. Keep one field as "*" to avoid conflicting schedules.';
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dayOfMonth'],
      message
    });
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dayOfWeek'],
      message
    });
  });

export type CronDraftInput = z.infer<typeof cronDraftSchema>;

export function getCronFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}