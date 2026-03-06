export function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, '\n');
}

export function normalizePlainText(value: string) {
  return normalizeLineEndings(value).trim();
}

export function isBlank(value: string) {
  return normalizePlainText(value).length === 0;
}

export function clampPreview(value: string, maxLength = 160) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

export function countCharacters(value: string) {
  return Array.from(value).length;
}
