import { z } from 'zod';

import { countCharacters, isBlank, normalizeLineEndings } from '@/lib/utils/text';
import { MAX_TOOL_INPUT_CHARACTERS, formatFieldErrors } from '@/lib/validation/common';

export const regexFlavors = ['java', 'plsql'] as const;

export type RegexFlavor = (typeof regexFlavors)[number];

export type RegexDraft = {
  expression: string;
  flavor: RegexFlavor;
  sampleText: string;
};

export const emptyRegexDraft: RegexDraft = {
  flavor: 'java',
  expression: '',
  sampleText: ''
};

function freeTextSchema(fieldLabel: string, required: boolean) {
  return z
    .string()
    .transform((value) => normalizeLineEndings(value))
    .superRefine((value, context) => {
      if (required && isBlank(value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} is required.`
        });
      }

      if (countCharacters(value) > MAX_TOOL_INPUT_CHARACTERS) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must stay under ${MAX_TOOL_INPUT_CHARACTERS.toLocaleString()} characters.`
        });
      }
    });
}

export const regexSchema = z.object({
  flavor: z.enum(regexFlavors),
  expression: freeTextSchema('Regex expression', true),
  sampleText: freeTextSchema('Sample text', false)
});

export function getRegexFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
