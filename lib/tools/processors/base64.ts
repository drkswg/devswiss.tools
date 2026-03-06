import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import { getBase64FieldErrors, type Base64Mode, base64ToolSchema } from '@/lib/validation/base64';

export type Base64ProcessorResult = {
  fieldErrors?: FieldErrors;
  message: string;
  state: Exclude<ValidationState, 'idle'>;
  value?: string;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: true });

function bytesToBinary(bytes: Uint8Array) {
  const chunkSize = 0x8000;
  let output = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    output += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return output;
}

function binaryToBytes(binary: string) {
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function normalizeEncodedInput(value: string) {
  return value.replace(/\s+/g, '');
}

export function processBase64(input: { inputValue: string; mode: Base64Mode }): Base64ProcessorResult {
  const parsed = base64ToolSchema.safeParse(input);
  if (!parsed.success) {
    return {
      state: 'invalid',
      message: 'Base64 input is outside the allowed limits.',
      fieldErrors: getBase64FieldErrors(parsed.error)
    };
  }

  const { inputValue, mode } = parsed.data;
  if (inputValue.length === 0) {
    return {
      state: 'invalid',
      message: `Enter text to ${mode}.`,
      fieldErrors: {
        inputValue: ['Input is required.']
      }
    };
  }

  try {
    if (mode === 'encode') {
      const encoded = btoa(bytesToBinary(textEncoder.encode(inputValue)));
      return {
        state: 'valid',
        value: encoded,
        message: 'Encoded the text as Base64.'
      };
    }

    const normalized = normalizeEncodedInput(inputValue);
    if (normalized.length === 0 || normalized.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
      return {
        state: 'invalid',
        message: 'Base64 input is malformed. Check the characters and padding before decoding.',
        fieldErrors: {
          inputValue: ['Base64 input is malformed.']
        }
      };
    }

    const decoded = textDecoder.decode(binaryToBytes(atob(normalized)));
    return {
      state: 'valid',
      value: decoded,
      message: 'Decoded the Base64 input.'
    };
  } catch {
    return {
      state: 'invalid',
      message: 'Base64 input is malformed. Check the characters and padding before decoding.',
      fieldErrors: {
        inputValue: ['Base64 input is malformed.']
      }
    };
  }
}
