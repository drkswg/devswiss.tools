'use client';

import { useState } from 'react';
import { Hash } from 'lucide-react';

import { ResultPanel } from '@/components/tools/shared/result-panel';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { hashWithBcrypt, type BcryptProcessorResult } from '@/lib/tools/processors/bcrypt';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import type { FieldErrors } from '@/lib/validation/common';
import { bcryptRoundsRange } from '@/lib/validation/bcrypt';

import styles from './bcrypt-tool.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const idleResult: BcryptProcessorResult = {
  state: 'valid',
  message: 'Enter plain text and rounds to generate a bcrypt hash.'
};

function getDescribedBy(fieldId: string, hasHint: boolean, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function BcryptTool() {
  const [inputValue, setInputValue] = useState('');
  const [rounds, setRounds] = useState('12');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<BcryptProcessorResult>(idleResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCopy() {
    const copyResult = await copyTextToClipboard(result.value ?? '');

    if (copyResult.ok) {
      setCopyFeedback({
        tone: 'success',
        title: 'Copied to clipboard',
        description: 'The generated bcrypt hash is ready to paste.'
      });
      return;
    }

    setCopyFeedback({
      tone: 'error',
      title: 'Copy unavailable',
      description:
        copyResult.reason === 'blocked'
          ? 'The browser blocked clipboard access. Copy the bcrypt hash manually.'
          : 'Clipboard access is not available in this environment.'
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextResult = await hashWithBcrypt({ inputValue, rounds });
      setFieldErrors(nextResult.fieldErrors ?? {});
      setResult(nextResult);
      setCopyFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={`surface-card ${styles.panel}`}>
      <div className={styles.panelHeader}>
        <div className="section-heading">
          <span className="section-eyebrow">Bcrypt workflow</span>
          <h2>Generate salted bcrypt hashes locally</h2>
          <p className="section-copy">
            Create bcrypt password hashes in the browser with an adjustable work factor and copy-ready output.
          </p>
        </div>
        <div className={styles.guidance}>
          <span className={styles.guidanceTitle}>Fresh salts change the output</span>
          <p className={styles.guidanceCopy}>
            Bcrypt generates a new salt for every run, so the same plain text and rounds can produce different
            valid hashes.
          </p>
        </div>
      </div>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <FormField
          error={fieldErrors.inputValue?.[0]}
          hint="The plain text stays in the browser during hashing."
          htmlFor="bcrypt-input"
          label="Plain text"
          required
        >
          <textarea
            aria-describedby={getDescribedBy('bcrypt-input', true, fieldErrors.inputValue?.[0])}
            id="bcrypt-input"
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Hash this password or secret locally"
            rows={8}
            value={inputValue}
          />
        </FormField>

        <FormField
          error={fieldErrors.rounds?.[0]}
          hint={`Choose bcrypt rounds from ${bcryptRoundsRange.min} through ${bcryptRoundsRange.max}. Higher rounds take longer.`}
          htmlFor="bcrypt-rounds"
          label="Rounds"
          labelSuffix={<span className={styles.roundsMeta}>Default: 12</span>}
          required
        >
          <input
            aria-describedby={getDescribedBy('bcrypt-rounds', true, fieldErrors.rounds?.[0])}
            id="bcrypt-rounds"
            inputMode="numeric"
            max={bcryptRoundsRange.max}
            min={bcryptRoundsRange.min}
            onChange={(event) => setRounds(event.target.value)}
            step={1}
            type="number"
            value={rounds}
          />
        </FormField>

        <div className={styles.actions}>
          <Button disabled={isSubmitting} type="submit">
            <Hash aria-hidden size={16} />
            {isSubmitting ? 'Generating bcrypt hash...' : 'Generate bcrypt hash'}
          </Button>
        </div>
      </form>

      <ResultPanel
        copyFeedback={copyFeedback}
        onCopy={result.state === 'valid' && result.value ? handleCopy : undefined}
        resultLabel="Bcrypt hash"
        state={result.state === 'valid' && !result.value ? 'idle' : result.state}
        statusDescription={
          result.state === 'valid' && result.value
            ? 'Hashes include the selected work factor and a fresh salt for each generation.'
            : undefined
        }
        statusTitle={result.message}
        value={result.value}
      />
    </section>
  );
}
