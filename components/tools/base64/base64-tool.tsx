'use client';

import { useState } from 'react';
import { Binary, RefreshCcw } from 'lucide-react';

import { ResultPanel } from '@/components/tools/shared/result-panel';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { processBase64, type Base64ProcessorResult } from '@/lib/tools/processors/base64';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import type { FieldErrors } from '@/lib/validation/common';
import type { Base64Mode } from '@/lib/validation/base64';

import styles from './base64-tool.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const idleResult: Base64ProcessorResult = {
  state: 'valid',
  message: 'Choose encode or decode to populate this panel.'
};

function getDescribedBy(fieldId: string, hasHint: boolean, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function Base64Tool() {
  const [mode, setMode] = useState<Base64Mode>('encode');
  const [inputValue, setInputValue] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<Base64ProcessorResult>(idleResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);

  const handleModeChange = (nextMode: Base64Mode) => {
    setMode(nextMode);
    setFieldErrors({});
    setCopyFeedback(null);
    setResult(idleResult);
  };

  async function handleCopy() {
    const copyResult = await copyTextToClipboard(result.value ?? '');

    if (copyResult.ok) {
      setCopyFeedback({
        tone: 'success',
        title: 'Copied to clipboard',
        description: 'The current Base64 result is ready to paste.'
      });
      return;
    }

    setCopyFeedback({
      tone: 'error',
      title: 'Copy unavailable',
      description:
        copyResult.reason === 'blocked'
          ? 'The browser blocked clipboard access. Copy the value manually.'
          : 'Clipboard access is not available in this environment.'
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextResult = processBase64({ inputValue, mode });

    setFieldErrors(nextResult.fieldErrors ?? {});
    setResult(nextResult);
    setCopyFeedback(null);
  }

  return (
    <section className={`surface-card ${styles.panel}`}>
      <div className={styles.panelHeader}>
        <div className="section-heading">
          <span className="section-eyebrow">Base64 workflow</span>
          <h2>{mode === 'encode' ? 'Encode text as Base64' : 'Decode Base64 to plain text'}</h2>
          <p className="section-copy">
            Unicode-safe text transforms stay in the browser, with explicit feedback for malformed or empty
            input.
          </p>
        </div>
        <div className={styles.modeSwitch} role="group" aria-label="Base64 action">
          <Button
            aria-pressed={mode === 'encode'}
            onClick={() => handleModeChange('encode')}
            variant={mode === 'encode' ? 'solid' : 'ghost'}
            tone={mode === 'encode' ? 'accent' : 'neutral'}
          >
            <Binary aria-hidden size={16} />
            Encode
          </Button>
          <Button
            aria-pressed={mode === 'decode'}
            onClick={() => handleModeChange('decode')}
            variant={mode === 'decode' ? 'solid' : 'ghost'}
            tone={mode === 'decode' ? 'accent' : 'neutral'}
          >
            <RefreshCcw aria-hidden size={16} />
            Decode
          </Button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField
          error={fieldErrors.inputValue?.[0]}
          hint={mode === 'encode' ? 'Plain text preserves Unicode characters when encoded.' : 'Whitespace is ignored while decoding.'}
          htmlFor="base64-input"
          label={mode === 'encode' ? 'Plain text' : 'Base64 input'}
          required
        >
          <textarea
            aria-describedby={getDescribedBy('base64-input', true, fieldErrors.inputValue?.[0])}
            id="base64-input"
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={mode === 'encode' ? 'Hello, DevTools 👋' : 'SGVsbG8sIERldlRvb2xzIPCfkYs='}
            rows={8}
            value={inputValue}
          />
        </FormField>

        <div className={styles.actions}>
          <Button type="submit">{mode === 'encode' ? 'Encode text' : 'Decode text'}</Button>
        </div>
      </form>

      <ResultPanel
        copyFeedback={copyFeedback}
        onCopy={result.state === 'valid' && result.value ? handleCopy : undefined}
        resultLabel="Base64 result"
        state={result.state === 'valid' && !result.value ? 'idle' : result.state}
        statusTitle={result.message}
        value={result.value}
      />
    </section>
  );
}
