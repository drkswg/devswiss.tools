import { z } from 'zod';

import { MAX_TOOL_INPUT_CHARACTERS, formatFieldErrors } from '@/lib/validation/common';

export const hashAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'] as const;
export type HashAlgorithm = (typeof hashAlgorithms)[number];

export const hashAlgorithmSchema = z.enum(hashAlgorithms);

export const hashToolSchema = z.object({
  algorithm: hashAlgorithmSchema,
  inputValue: z
    .string()
    .max(MAX_TOOL_INPUT_CHARACTERS, `Input must be ${MAX_TOOL_INPUT_CHARACTERS.toLocaleString()} characters or fewer.`)
});

export type HashToolInput = z.infer<typeof hashToolSchema>;

export function isLegacyHashAlgorithm(algorithm: HashAlgorithm) {
  return algorithm === 'md5' || algorithm === 'sha1';
}

export function getHashFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
