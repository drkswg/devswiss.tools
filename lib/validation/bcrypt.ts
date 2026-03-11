import { z } from 'zod';

import { MAX_TOOL_INPUT_CHARACTERS, formatFieldErrors } from '@/lib/validation/common';
import { isBlank } from '@/lib/utils/text';

export const bcryptRoundsRange = {
  min: 1,
  max: 20
} as const;

const roundsErrorMessage = `Rounds must be between ${bcryptRoundsRange.min} and ${bcryptRoundsRange.max}.`;

export const bcryptToolSchema = z.object({
  inputValue: z
    .string()
    .max(MAX_TOOL_INPUT_CHARACTERS, `Input must be ${MAX_TOOL_INPUT_CHARACTERS.toLocaleString()} characters or fewer.`)
    .refine((value) => !isBlank(value), {
      message: 'Plain text is required.'
    }),
  rounds: z.coerce
    .number({
      error: () => roundsErrorMessage
    })
    .int('Rounds must be a whole number.')
    .min(bcryptRoundsRange.min, roundsErrorMessage)
    .max(bcryptRoundsRange.max, roundsErrorMessage)
});

export type BcryptToolInput = z.input<typeof bcryptToolSchema>;
export type ParsedBcryptToolInput = z.infer<typeof bcryptToolSchema>;

export function getBcryptFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
