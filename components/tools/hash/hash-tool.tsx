'use client';

import { useState } from 'react';
import { AlertTriangle, Hash as HashIcon } from 'lucide-react';

import { ResultPanel } from '@/components/tools/shared/result-panel';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { hashText, type HashProcessorResult } from '@/lib/tools/processors/hash';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import type { FieldErrors } from '@/lib/validation/common';
import { hashAlgorithms, isLegacyHashAlgorithm, type HashAlgorithm } from '@/lib/validation/hash';

import styles from './hash-tool.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const algorithmLabels: Record<HashAlgorithm, string> = {
  md5: 'MD5',
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512'
};

const idleResult: HashProcessorResult = {
  state: 'valid',
  message: 'Select an algorithm and submit text to create a hash.'
};

function getDescribedBy(fieldId: string, hasHint: boolean, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function HashTool() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha256');
  const [inputValue, setInputValue] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<HashProcessorResult>(idleResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const legacySelected = isLegacyHashAlgorithm(algorithm);

  async function handleCopy() {
    const copyResult = await copyTextToClipboard(result.value ?? '');

    if (copyResult.ok) {
      setCopyFeedback({
        tone: 'success',
        title: 'Copied to clipboard',
        description: 'The generated hash is ready to paste.'
      });
      return;
    }

    setCopyFeedback({
      tone: 'error',
      title: 'Copy unavailable',
      description:
        copyResult.reason === 'blocked'
          ? 'The browser blocked clipboard access. Copy the hash manually.'
          : 'Clipboard access is not available in this environment.'
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextResult = await hashText({ algorithm, inputValue });
      setFieldErrors(nextResult.fieldErrors ?? {});
      setResult(nextResult);
      setCopyFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.layout}>
      <section className={`surface-card ${styles.panel}`}>
        <div className={styles.panelHeader}>
          <div className="section-heading">
            <span className="section-eyebrow">Hash workflow</span>
            <h2>Generate browser-side hashes</h2>
            <p className="section-copy">
              Choose an algorithm, hash plain text locally, and keep legacy compatibility algorithms clearly
              labeled.
            </p>
          </div>
          {legacySelected ? (
            <div className={styles.legacyNotice}>
              <AlertTriangle aria-hidden size={16} />
              <span>{algorithmLabels[algorithm]} is a legacy option. Prefer SHA-256 or SHA-512 for new work.</span>
            </div>
          ) : null}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField
            hint="MD5 and SHA-1 remain available for compatibility only."
            htmlFor="hash-algorithm"
            label="Algorithm"
          >
            <select id="hash-algorithm" onChange={(event) => setAlgorithm(event.target.value as HashAlgorithm)} value={algorithm}>
              {hashAlgorithms.map((item) => (
                <option key={item} value={item}>
                  {algorithmLabels[item]}
                  {isLegacyHashAlgorithm(item) ? ' (legacy)' : ''}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            error={fieldErrors.inputValue?.[0]}
            hint="Input remains local to the browser during hashing."
            htmlFor="hash-input"
            label="Plain text"
            required
          >
            <textarea
              aria-describedby={getDescribedBy('hash-input', true, fieldErrors.inputValue?.[0])}
              id="hash-input"
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Hash this value"
              rows={8}
              value={inputValue}
            />
          </FormField>

          <div className={styles.actions}>
            <Button type="submit">
              <HashIcon aria-hidden size={16} />
              {isSubmitting ? 'Generating hash...' : 'Generate hash'}
            </Button>
          </div>
        </form>
      </section>

      <ResultPanel
        copyFeedback={copyFeedback}
        onCopy={result.state === 'valid' && result.value ? handleCopy : undefined}
        resultLabel="Hash result"
        state={result.state === 'valid' && !result.value ? 'idle' : result.state}
        statusDescription={result.legacy ? 'Legacy algorithms stay visible for compatibility workflows.' : undefined}
        statusTitle={result.message}
        tone={result.legacy ? 'warning' : undefined}
        value={result.value}
      />
    </div>
  );
}
