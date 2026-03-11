import { normalizeLineEndings } from '@/lib/utils/text';

export type DownloadTextFileResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'unsupported' };

export async function readTextFile(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return normalizeLineEndings(await file.text());
  }

  if (typeof FileReader === 'undefined') {
    throw new Error('File reading is not supported in this environment.');
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => resolve(normalizeLineEndings(String(reader.result ?? '')));
    reader.readAsText(file);
  });
}

export function downloadTextFile(filename: string, value: string, mimeType = 'application/xml;charset=utf-8'): DownloadTextFileResult {
  if (!value.trim()) {
    return { ok: false, reason: 'empty' };
  }

  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof URL.revokeObjectURL !== 'function' ||
    typeof Blob === 'undefined'
  ) {
    return { ok: false, reason: 'unsupported' };
  }

  const blob = new Blob([value], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);

  return { ok: true };
}
