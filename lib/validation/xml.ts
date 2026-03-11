import { z } from 'zod';

import { normalizeLineEndings } from '@/lib/utils/text';
import { MAX_TOOL_INPUT_CHARACTERS, formatFieldErrors } from '@/lib/validation/common';

export const xmlIndentSizes = [2, 3, 4] as const;
export const xmlTransformModes = ['format', 'minify', 'convert'] as const;

export type XmlIndentSize = (typeof xmlIndentSizes)[number];
export type XmlTransformMode = (typeof xmlTransformModes)[number];

export const xmlIndentSizeSchema = z.union([z.literal(2), z.literal(3), z.literal(4)]);
export const xmlTransformModeSchema = z.enum(xmlTransformModes);

export const xmlToolSchema = z.object({
  inputValue: z
    .string()
    .max(MAX_TOOL_INPUT_CHARACTERS, `XML input must be ${MAX_TOOL_INPUT_CHARACTERS.toLocaleString()} characters or fewer.`)
    .transform((value) => normalizeLineEndings(value)),
  indentSize: xmlIndentSizeSchema,
  mode: xmlTransformModeSchema
});

export function getXmlFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
