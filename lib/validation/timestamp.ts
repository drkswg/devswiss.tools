import { z } from 'zod';

import { formatFieldErrors } from '@/lib/validation/common';

export const timestampInputUnits = ['auto', 'seconds', 'milliseconds'] as const;
export const timestampTimezoneModes = ['utc', 'local'] as const;
export const timestampOutputUnits = ['seconds', 'milliseconds'] as const;

export type TimestampInputUnit = (typeof timestampInputUnits)[number];
export type TimestampTimezoneMode = (typeof timestampTimezoneModes)[number];
export type TimestampOutputUnit = (typeof timestampOutputUnits)[number];

export type TimestampExplainDraft = {
  inputUnit: TimestampInputUnit;
  rawTimestamp: string;
};

export type TimestampGenerateDraft = {
  dateTime: string;
  outputUnit: TimestampOutputUnit;
  timezone: TimestampTimezoneMode;
};

export const emptyTimestampExplainDraft: TimestampExplainDraft = {
  rawTimestamp: '',
  inputUnit: 'auto'
};

export const emptyTimestampGenerateDraft: TimestampGenerateDraft = {
  dateTime: '',
  timezone: 'utc',
  outputUnit: 'seconds'
};

const signedIntegerPattern = /^[+-]?\d+$/;
const dateTimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export const timestampExplainSchema = z.object({
  inputUnit: z.enum(timestampInputUnits),
  rawTimestamp: z
    .string()
    .trim()
    .min(1, 'Timestamp is required.')
    .refine((value) => signedIntegerPattern.test(value), {
      message: 'Timestamp must be a signed whole number in seconds or milliseconds.'
    })
});

export const timestampGenerateSchema = z.object({
  dateTime: z
    .string()
    .trim()
    .min(1, 'Date and time is required.')
    .refine((value) => dateTimeLocalPattern.test(value), {
      message: 'Date and time must use the browser date-time format.'
    }),
  timezone: z.enum(timestampTimezoneModes),
  outputUnit: z.enum(timestampOutputUnits)
});

export function getTimestampFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
