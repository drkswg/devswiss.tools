export type ClipboardCopyResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'unsupported' | 'blocked' };

function legacyCopyText(value: string) {
  const element = document.createElement('textarea');
  element.value = value;
  element.setAttribute('readonly', 'true');
  element.style.position = 'fixed';
  element.style.opacity = '0';
  document.body.appendChild(element);
  element.focus();
  element.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(element);
  }
}

export async function copyTextToClipboard(value: string): Promise<ClipboardCopyResult> {
  if (!value.trim()) {
    return { ok: false, reason: 'empty' };
  }

  if (typeof navigator === 'undefined') {
    return { ok: false, reason: 'unsupported' };
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return { ok: true };
    } catch {
      return { ok: false, reason: 'blocked' };
    }
  }

  if (typeof document !== 'undefined' && legacyCopyText(value)) {
    return { ok: true };
  }

  return { ok: false, reason: 'unsupported' };
}
