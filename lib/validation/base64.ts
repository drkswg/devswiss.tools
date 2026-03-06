import { z } from 'zod';

import { MAX_TOOL_INPUT_CHARACTERS, formatFieldErrors } from '@/lib/validation/common';

export const base64Modes = ['encode', 'decode'] as const;
export type Base64Mode = (typeof base64Modes)[number];

export const base64ModeSchema = z.enum(base64Modes);

export const base64ToolSchema = z.object({
  mode: base64ModeSchema,
  inputValue: z
    .string()
    .max(MAX_TOOL_INPUT_CHARACTERS, `Input must be ${MAX_TOOL_INPUT_CHARACTERS.toLocaleString()} characters or fewer.`)
});

export type Base64ToolInput = z.infer<typeof base64ToolSchema>;

export function getBase64FieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
