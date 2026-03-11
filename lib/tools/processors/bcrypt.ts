import { hash } from 'bcryptjs';

import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import {
  bcryptToolSchema,
  getBcryptFieldErrors,
  type BcryptToolInput,
  type ParsedBcryptToolInput
} from '@/lib/validation/bcrypt';

export type BcryptProcessorResult = {
  fieldErrors?: FieldErrors;
  inputValue?: string;
  message: string;
  rounds?: number;
  state: Exclude<ValidationState, 'idle'>;
  value?: string;
};

async function generateBcryptHash({ inputValue, rounds }: ParsedBcryptToolInput) {
  return hash(inputValue, rounds);
}

export async function hashWithBcrypt(input: BcryptToolInput): Promise<BcryptProcessorResult> {
  const parsed = bcryptToolSchema.safeParse(input);

  if (!parsed.success) {
    return {
      state: 'invalid',
      message: 'Bcrypt input is outside the supported limits.',
      fieldErrors: getBcryptFieldErrors(parsed.error)
    };
  }

  try {
    const value = await generateBcryptHash(parsed.data);

    return {
      state: 'valid',
      inputValue: parsed.data.inputValue,
      rounds: parsed.data.rounds,
      value,
      message: `Bcrypt hash generated with ${parsed.data.rounds} rounds.`
    };
  } catch {
    return {
      state: 'error',
      inputValue: parsed.data.inputValue,
      rounds: parsed.data.rounds,
      message: 'The browser could not generate a bcrypt hash.'
    };
  }
}
