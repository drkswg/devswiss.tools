import cronstrue from 'cronstrue';

import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import { cronDraftSchema, getCronFieldErrors, type CronDraft } from '@/lib/validation/cron';

export type CronProcessorResult = {
  errors?: string[];
  expression?: string;
  fieldErrors?: FieldErrors;
  humanSummary?: string;
  message: string;
  state: Exclude<ValidationState, 'idle'>;
};

function buildErrorList(fieldErrors: FieldErrors, fallbackIssues: string[]) {
  const flattenedFieldErrors = Object.values(fieldErrors).flat();
  const candidateIssues = [...flattenedFieldErrors, ...fallbackIssues];
  return Array.from(new Set(candidateIssues));
}

function isNumericSegment(value: string) {
  return /^\d+$/.test(value);
}

function formatClock(hours: string, minutes = '0', seconds?: string) {
  const hour = Number.parseInt(hours, 10);
  const minute = Number.parseInt(minutes, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 || 12;
  const base = `${normalizedHour}:${String(minute).padStart(2, '0')}`;

  if (seconds === undefined) {
    return `${base} ${suffix}`;
  }

  return `${base}:${String(Number.parseInt(seconds, 10)).padStart(2, '0')} ${suffix}`;
}

function buildExpression(input: CronDraft) {
  const baseFields = [input.minutes, input.hours, input.dayOfMonth, input.month, input.dayOfWeek];

  if (input.fieldCount === '5') {
    return baseFields.join(' ');
  }

  return [input.seconds, ...baseFields].join(' ');
}

function buildReadableSummary(input: CronDraft, fallbackSummary: string) {
  const { dayOfMonth, dayOfWeek, fieldCount, hours, minutes, month, seconds } = input;
  const isDaily = dayOfMonth === '*' && dayOfWeek === '*' && month === '*';

  if (fieldCount === '5' && isDaily && isNumericSegment(hours) && isNumericSegment(minutes)) {
    return `Every day at ${formatClock(hours, minutes)}`;
  }

  if (fieldCount === '5' && isDaily && isNumericSegment(hours) && minutes === '*') {
    return `Every minute during the ${formatClock(hours)} hour every day`;
  }

  if (
    fieldCount === '6' &&
    isDaily &&
    isNumericSegment(hours) &&
    isNumericSegment(minutes) &&
    isNumericSegment(seconds)
  ) {
    return `Every day at ${formatClock(hours, minutes, seconds)}`;
  }

  if (fieldCount === '6' && isDaily && isNumericSegment(hours) && minutes === '*' && seconds === '*') {
    return `Every second during the ${formatClock(hours)} hour every day`;
  }

  if (
    fieldCount === '6' &&
    isDaily &&
    isNumericSegment(hours) &&
    isNumericSegment(minutes) &&
    seconds === '*'
  ) {
    return `Every second at ${formatClock(hours, minutes)} every day`;
  }

  return fallbackSummary.replace(/^Every second, every minute, /, 'Every second during the ');
}

export function buildCronExpression(input: CronDraft): CronProcessorResult {
  const parsed = cronDraftSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = getCronFieldErrors(parsed.error);
    const errors = buildErrorList(
      fieldErrors,
      parsed.error.issues.map((issue) => issue.message)
    );

    return {
      state: 'invalid',
      message: 'Update the highlighted cron selections before generating an expression.',
      fieldErrors,
      errors
    };
  }

  const expression = buildExpression(parsed.data);

  try {
    const rawSummary = cronstrue.toString(expression, {
      use24HourTimeFormat: true,
      verbose: true
    });
    const humanSummary = buildReadableSummary(parsed.data, rawSummary);

    return {
      state: 'valid',
      expression,
      humanSummary,
      message: 'Cron expression generated.'
    };
  } catch {
    return {
      state: 'error',
      expression,
      message:
        'The cron expression could not be summarized. Adjust the selected fields and try again.'
    };
  }
}