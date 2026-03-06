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

  const expression = [
    parsed.data.seconds,
    parsed.data.minutes,
    parsed.data.hours,
    parsed.data.dayOfMonth,
    parsed.data.month,
    parsed.data.dayOfWeek
  ].join(' ');

  try {
    const humanSummary = cronstrue.toString(expression, {
      use24HourTimeFormat: true,
      verbose: true
    });

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
