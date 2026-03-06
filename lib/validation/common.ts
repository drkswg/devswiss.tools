import { z } from 'zod';

import { isBlank, normalizePlainText } from '@/lib/utils/text';

export const validationStates = ['idle', 'valid', 'invalid', 'error'] as const;
export type ValidationState = (typeof validationStates)[number];
export const MAX_TOOL_INPUT_CHARACTERS = 100_000;

export const validationStateSchema = z.enum(validationStates);

export const trimmedTextSchema = z.string().transform((value) => normalizePlainText(value));

export function requiredTextSchema(label: string) {
  return trimmedTextSchema.refine((value) => !isBlank(value), {
    message: `${label} is required.`
  });
}

export function optionalTextSchema() {
  return trimmedTextSchema.optional().transform((value) => value ?? '');
}

export type FieldErrors = Record<string, string[]>;

export function formatFieldErrors(error: z.ZodError): FieldErrors {
  return error.issues.reduce<FieldErrors>((result, issue) => {
    const key = issue.path.join('.') || 'root';
    result[key] = [...(result[key] ?? []), issue.message];
    return result;
  }, {});
}

export function firstFieldError(fieldErrors: FieldErrors, key: string) {
  return fieldErrors[key]?.[0];
}
