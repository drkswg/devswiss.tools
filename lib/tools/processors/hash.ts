import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import { getHashFieldErrors, hashToolSchema, isLegacyHashAlgorithm, type HashAlgorithm } from '@/lib/validation/hash';

export type HashProcessorResult = {
  algorithm?: HashAlgorithm;
  fieldErrors?: FieldErrors;
  legacy?: boolean;
  message: string;
  state: Exclude<ValidationState, 'idle'>;
  value?: string;
};

const digestMap: Record<Exclude<HashAlgorithm, 'md5'>, AlgorithmIdentifier> = {
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512'
};

function toHex(value: ArrayBuffer | Uint8Array) {
  return Array.from(value instanceof Uint8Array ? value : new Uint8Array(value), (item) =>
    item.toString(16).padStart(2, '0')
  ).join('');
}

function safeAdd(left: number, right: number) {
  const leastSignificant = (left & 0xffff) + (right & 0xffff);
  const mostSignificant = (left >> 16) + (right >> 16) + (leastSignificant >> 16);

  return (mostSignificant << 16) | (leastSignificant & 0xffff);
}

function bitRotateLeft(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift));
}

function md5Common(q: number, a: number, b: number, x: number, s: number, t: number) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5Ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5Common((b & c) | (~b & d), a, b, x, s, t);
}

function md5Gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5Common((b & d) | (c & ~d), a, b, x, s, t);
}

function md5Hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5Common(b ^ c ^ d, a, b, x, s, t);
}

function md5Ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5Common(c ^ (b | ~d), a, b, x, s, t);
}

function bytesToLittleEndianWords(bytes: Uint8Array) {
  const words = new Array<number>(((bytes.length + 3) >> 2)).fill(0);

  for (let index = 0; index < bytes.length; index += 1) {
    words[index >> 2] |= bytes[index] << ((index % 4) * 8);
  }

  return words;
}

function littleEndianWordsToBytes(words: number[]) {
  const output = new Uint8Array(words.length * 4);

  for (let index = 0; index < words.length; index += 1) {
    output[index * 4] = words[index] & 0xff;
    output[index * 4 + 1] = (words[index] >>> 8) & 0xff;
    output[index * 4 + 2] = (words[index] >>> 16) & 0xff;
    output[index * 4 + 3] = (words[index] >>> 24) & 0xff;
  }

  return output;
}

function md5Digest(input: Uint8Array) {
  const words = bytesToLittleEndianWords(input);
  const bitLength = input.length * 8;

  words[bitLength >> 5] = (words[bitLength >> 5] ?? 0) | (0x80 << (bitLength % 32));
  words[(((bitLength + 64) >>> 9) << 4) + 14] = bitLength;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let index = 0; index < words.length; index += 16) {
    const previousA = a;
    const previousB = b;
    const previousC = c;
    const previousD = d;

    a = md5Ff(a, b, c, d, words[index] ?? 0, 7, -680876936);
    d = md5Ff(d, a, b, c, words[index + 1] ?? 0, 12, -389564586);
    c = md5Ff(c, d, a, b, words[index + 2] ?? 0, 17, 606105819);
    b = md5Ff(b, c, d, a, words[index + 3] ?? 0, 22, -1044525330);
    a = md5Ff(a, b, c, d, words[index + 4] ?? 0, 7, -176418897);
    d = md5Ff(d, a, b, c, words[index + 5] ?? 0, 12, 1200080426);
    c = md5Ff(c, d, a, b, words[index + 6] ?? 0, 17, -1473231341);
    b = md5Ff(b, c, d, a, words[index + 7] ?? 0, 22, -45705983);
    a = md5Ff(a, b, c, d, words[index + 8] ?? 0, 7, 1770035416);
    d = md5Ff(d, a, b, c, words[index + 9] ?? 0, 12, -1958414417);
    c = md5Ff(c, d, a, b, words[index + 10] ?? 0, 17, -42063);
    b = md5Ff(b, c, d, a, words[index + 11] ?? 0, 22, -1990404162);
    a = md5Ff(a, b, c, d, words[index + 12] ?? 0, 7, 1804603682);
    d = md5Ff(d, a, b, c, words[index + 13] ?? 0, 12, -40341101);
    c = md5Ff(c, d, a, b, words[index + 14] ?? 0, 17, -1502002290);
    b = md5Ff(b, c, d, a, words[index + 15] ?? 0, 22, 1236535329);

    a = md5Gg(a, b, c, d, words[index + 1] ?? 0, 5, -165796510);
    d = md5Gg(d, a, b, c, words[index + 6] ?? 0, 9, -1069501632);
    c = md5Gg(c, d, a, b, words[index + 11] ?? 0, 14, 643717713);
    b = md5Gg(b, c, d, a, words[index] ?? 0, 20, -373897302);
    a = md5Gg(a, b, c, d, words[index + 5] ?? 0, 5, -701558691);
    d = md5Gg(d, a, b, c, words[index + 10] ?? 0, 9, 38016083);
    c = md5Gg(c, d, a, b, words[index + 15] ?? 0, 14, -660478335);
    b = md5Gg(b, c, d, a, words[index + 4] ?? 0, 20, -405537848);
    a = md5Gg(a, b, c, d, words[index + 9] ?? 0, 5, 568446438);
    d = md5Gg(d, a, b, c, words[index + 14] ?? 0, 9, -1019803690);
    c = md5Gg(c, d, a, b, words[index + 3] ?? 0, 14, -187363961);
    b = md5Gg(b, c, d, a, words[index + 8] ?? 0, 20, 1163531501);
    a = md5Gg(a, b, c, d, words[index + 13] ?? 0, 5, -1444681467);
    d = md5Gg(d, a, b, c, words[index + 2] ?? 0, 9, -51403784);
    c = md5Gg(c, d, a, b, words[index + 7] ?? 0, 14, 1735328473);
    b = md5Gg(b, c, d, a, words[index + 12] ?? 0, 20, -1926607734);

    a = md5Hh(a, b, c, d, words[index + 5] ?? 0, 4, -378558);
    d = md5Hh(d, a, b, c, words[index + 8] ?? 0, 11, -2022574463);
    c = md5Hh(c, d, a, b, words[index + 11] ?? 0, 16, 1839030562);
    b = md5Hh(b, c, d, a, words[index + 14] ?? 0, 23, -35309556);
    a = md5Hh(a, b, c, d, words[index + 1] ?? 0, 4, -1530992060);
    d = md5Hh(d, a, b, c, words[index + 4] ?? 0, 11, 1272893353);
    c = md5Hh(c, d, a, b, words[index + 7] ?? 0, 16, -155497632);
    b = md5Hh(b, c, d, a, words[index + 10] ?? 0, 23, -1094730640);
    a = md5Hh(a, b, c, d, words[index + 13] ?? 0, 4, 681279174);
    d = md5Hh(d, a, b, c, words[index] ?? 0, 11, -358537222);
    c = md5Hh(c, d, a, b, words[index + 3] ?? 0, 16, -722521979);
    b = md5Hh(b, c, d, a, words[index + 6] ?? 0, 23, 76029189);
    a = md5Hh(a, b, c, d, words[index + 9] ?? 0, 4, -640364487);
    d = md5Hh(d, a, b, c, words[index + 12] ?? 0, 11, -421815835);
    c = md5Hh(c, d, a, b, words[index + 15] ?? 0, 16, 530742520);
    b = md5Hh(b, c, d, a, words[index + 2] ?? 0, 23, -995338651);

    a = md5Ii(a, b, c, d, words[index] ?? 0, 6, -198630844);
    d = md5Ii(d, a, b, c, words[index + 7] ?? 0, 10, 1126891415);
    c = md5Ii(c, d, a, b, words[index + 14] ?? 0, 15, -1416354905);
    b = md5Ii(b, c, d, a, words[index + 5] ?? 0, 21, -57434055);
    a = md5Ii(a, b, c, d, words[index + 12] ?? 0, 6, 1700485571);
    d = md5Ii(d, a, b, c, words[index + 3] ?? 0, 10, -1894986606);
    c = md5Ii(c, d, a, b, words[index + 10] ?? 0, 15, -1051523);
    b = md5Ii(b, c, d, a, words[index + 1] ?? 0, 21, -2054922799);
    a = md5Ii(a, b, c, d, words[index + 8] ?? 0, 6, 1873313359);
    d = md5Ii(d, a, b, c, words[index + 15] ?? 0, 10, -30611744);
    c = md5Ii(c, d, a, b, words[index + 6] ?? 0, 15, -1560198380);
    b = md5Ii(b, c, d, a, words[index + 13] ?? 0, 21, 1309151649);
    a = md5Ii(a, b, c, d, words[index + 4] ?? 0, 6, -145523070);
    d = md5Ii(d, a, b, c, words[index + 11] ?? 0, 10, -1120210379);
    c = md5Ii(c, d, a, b, words[index + 2] ?? 0, 15, 718787259);
    b = md5Ii(b, c, d, a, words[index + 9] ?? 0, 21, -343485551);

    a = safeAdd(a, previousA);
    b = safeAdd(b, previousB);
    c = safeAdd(c, previousC);
    d = safeAdd(d, previousD);
  }

  return littleEndianWordsToBytes([a, b, c, d]);
}

async function digestHash(algorithm: HashAlgorithm, bytes: Uint8Array) {
  if (algorithm === 'md5') {
    return toHex(md5Digest(bytes));
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error('SubtleCrypto unavailable');
  }

  const digestBytes = new Uint8Array(bytes.byteLength);
  digestBytes.set(bytes);

  return toHex(await globalThis.crypto.subtle.digest(digestMap[algorithm], digestBytes));
}

export async function hashText(input: { algorithm: HashAlgorithm; inputValue: string }): Promise<HashProcessorResult> {
  const parsed = hashToolSchema.safeParse(input);
  if (!parsed.success) {
    return {
      state: 'invalid',
      message: 'Hash input is outside the allowed limits.',
      fieldErrors: getHashFieldErrors(parsed.error)
    };
  }

  const { algorithm, inputValue } = parsed.data;
  if (inputValue.length === 0) {
    return {
      state: 'invalid',
      algorithm,
      message: 'Enter text to hash.',
      fieldErrors: {
        inputValue: ['Input is required.']
      }
    };
  }

  try {
    const value = await digestHash(algorithm, new TextEncoder().encode(inputValue));
    const legacy = isLegacyHashAlgorithm(algorithm);

    return {
      state: 'valid',
      algorithm,
      legacy,
      value,
      message: legacy
        ? `${algorithm.toUpperCase()} is a legacy hash. Use it only for compatibility.`
        : `${algorithm.toUpperCase()} hash generated.`
    };
  } catch {
    return {
      state: 'error',
      algorithm,
      message: 'The browser could not generate the requested hash.'
    };
  }
}
