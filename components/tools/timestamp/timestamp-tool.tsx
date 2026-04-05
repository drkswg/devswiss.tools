'use client';

import { useState } from 'react';

import { ResultPanel } from '@/components/tools/shared/result-panel';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import {
  explainTimestamp,
  generateTimestamp,
  type TimestampExplanationDetails,
  type TimestampGenerationDetails,
  type TimestampProcessorResult
} from '@/lib/tools/processors/timestamp';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import type { FieldErrors } from '@/lib/validation/common';
import {
  emptyTimestampExplainDraft,
  emptyTimestampGenerateDraft,
  timestampInputUnits,
  timestampOutputUnits,
  timestampTimezoneModes,
  type TimestampExplainDraft,
  type TimestampGenerateDraft
} from '@/lib/validation/timestamp';

import styles from './timestamp-tool.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const idleExplainResult: TimestampProcessorResult = {
  state: 'valid',
  message: 'Paste a Unix timestamp to resolve its unit and see the corresponding UTC date and time.'
};

const idleGenerateResult: TimestampProcessorResult = {
  state: 'valid',
  message: 'Enter a date and time to generate a copy-ready Unix timestamp.'
};

function getDescribedBy(fieldId: string, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function hasExplanationDetails(
  details: TimestampProcessorResult['details']
): details is TimestampExplanationDetails {
  return Boolean(details && 'resolvedUnit' in details);
}

function hasGenerationDetails(
  details: TimestampProcessorResult['details']
): details is TimestampGenerationDetails {
  return Boolean(details && 'interpretedAs' in details);
}

export function TimestampTool() {
  const [explainDraft, setExplainDraft] = useState<TimestampExplainDraft>(emptyTimestampExplainDraft);
  const [generateDraft, setGenerateDraft] = useState<TimestampGenerateDraft>(emptyTimestampGenerateDraft);
  const [explainFieldErrors, setExplainFieldErrors] = useState<FieldErrors>({});
  const [generateFieldErrors, setGenerateFieldErrors] = useState<FieldErrors>({});
  const [explainResult, setExplainResult] = useState<TimestampProcessorResult>(idleExplainResult);
  const [generateResult, setGenerateResult] = useState<TimestampProcessorResult>(idleGenerateResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  function updateExplainDraft<K extends keyof TimestampExplainDraft>(key: K, value: TimestampExplainDraft[K]) {
    setExplainDraft((previous) => ({ ...previous, [key]: value }));
    setExplainFieldErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([field]) => field !== key)));
  }

  function updateGenerateDraft<K extends keyof TimestampGenerateDraft>(key: K, value: TimestampGenerateDraft[K]) {
    setGenerateDraft((previous) => ({ ...previous, [key]: value }));
    setGenerateFieldErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([field]) => field !== key)));
    setCopyFeedback(null);
  }

  function handleExplainSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsExplaining(true);

    try {
      const nextResult = explainTimestamp(explainDraft);
      setExplainFieldErrors(nextResult.fieldErrors ?? {});
      setExplainResult(nextResult);
    } finally {
      setIsExplaining(false);
    }
  }

  function handleGenerateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);

    try {
      const nextResult = generateTimestamp(generateDraft);
      setGenerateFieldErrors(nextResult.fieldErrors ?? {});
      setGenerateResult(nextResult);
      setCopyFeedback(null);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    const copyResult = await copyTextToClipboard(generateResult.value ?? '');

    if (copyResult.ok) {
      setCopyFeedback({
        tone: 'success',
        title: 'Copied to clipboard',
        description: 'The generated timestamp is ready to paste.'
      });
      return;
    }

    setCopyFeedback({
      tone: 'error',
      title: 'Copy unavailable',
      description:
        copyResult.reason === 'blocked'
          ? 'The browser blocked clipboard access. Copy the generated timestamp manually.'
          : 'Clipboard access is not available in this environment.'
    });
  }

  const explainDetails = hasExplanationDetails(explainResult.details) ? explainResult.details : null;
  const generatedDetails = hasGenerationDetails(generateResult.details) ? generateResult.details : null;

  return (
    <div className={styles.layout}>
      <section aria-label="Timestamp explainer workflow" className={`surface-card ${styles.workflowColumn}`}>
        <div className={styles.header}>
          <div className="section-heading">
            <span className="section-eyebrow">Explain timestamp</span>
            <h2>Resolve Unix timestamps into UTC date and time</h2>
            <p className="section-copy">
              Paste signed seconds or milliseconds, keep auto-detect for the common case, and confirm the resolved unit.
            </p>
          </div>
          <div className={styles.guidance}>
            <span className={styles.guidanceTitle}>Auto-detect stays visible</span>
            <p className={styles.guidanceCopy}>
              Ambiguous historical values can look like either seconds or milliseconds, so the result always shows the
              unit that was actually used.
            </p>
          </div>
        </div>

        <form className={styles.form} noValidate onSubmit={handleExplainSubmit}>
          <FormField
            error={explainFieldErrors.rawTimestamp?.[0]}
            hint="Signed whole numbers are accepted. Use seconds for 10-digit epoch values and milliseconds for 13-digit values."
            htmlFor="timestamp-raw"
            label="Unix timestamp"
            required
          >
            <input
              aria-describedby={getDescribedBy('timestamp-raw', explainFieldErrors.rawTimestamp?.[0])}
              id="timestamp-raw"
              inputMode="numeric"
              onChange={(event) => updateExplainDraft('rawTimestamp', event.target.value)}
              placeholder="1712297105"
              type="text"
              value={explainDraft.rawTimestamp}
            />
          </FormField>

          <FormField
            error={explainFieldErrors.inputUnit?.[0]}
            hint="Use auto-detect unless you need to force seconds or milliseconds."
            htmlFor="timestamp-input-unit"
            label="Input unit"
            required
          >
            <select
              aria-describedby={getDescribedBy('timestamp-input-unit', explainFieldErrors.inputUnit?.[0])}
              id="timestamp-input-unit"
              onChange={(event) => updateExplainDraft('inputUnit', event.target.value as TimestampExplainDraft['inputUnit'])}
              value={explainDraft.inputUnit}
            >
              {timestampInputUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {formatLabel(unit)}
                </option>
              ))}
            </select>
          </FormField>

          <div className={styles.actions}>
            <Button disabled={isExplaining} type="submit">
              {isExplaining ? 'Explaining timestamp...' : 'Explain timestamp'}
            </Button>
          </div>
        </form>

        <ResultPanel
          resultLabel="Normalized timestamp"
          state={explainResult.state === 'valid' && !explainResult.value ? 'idle' : explainResult.state}
          statusDescription={
            explainDetails ? `Resolved unit: ${explainDetails.resolvedUnit}. Canonical UTC output stays deterministic across environments.` : undefined
          }
          statusTitle={explainResult.message}
          value={explainResult.value}
        />

        <section aria-label="Timestamp explanation details" className={styles.details}>
          <div className="section-heading">
            <span className="section-eyebrow">Details</span>
            <h2>Resolved output</h2>
          </div>
          <dl className={styles.detailList}>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Resolved unit</dt>
              <dd className={styles.detailValue}>{explainDetails ? formatLabel(explainDetails.resolvedUnit) : 'No explanation yet.'}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>UTC date and time</dt>
              <dd className={`${styles.detailValue} ${styles.mono}`}>{explainDetails?.utcDateTime ?? 'Submit a timestamp to populate this value.'}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>ISO 8601</dt>
              <dd className={`${styles.detailValue} ${styles.mono}`}>{explainDetails?.iso8601 ?? 'Submit a timestamp to populate this value.'}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Epoch milliseconds</dt>
              <dd className={`${styles.detailValue} ${styles.mono}`}>{explainDetails?.epochMilliseconds ?? 'Submit a timestamp to populate this value.'}</dd>
            </div>
          </dl>
        </section>
      </section>

      <section aria-label="Timestamp generator workflow" className={`surface-card ${styles.workflowColumn}`}>
        <div className={styles.header}>
          <div className="section-heading">
            <span className="section-eyebrow">Generate timestamp</span>
            <h2>Convert date and time values back into Unix timestamps</h2>
            <p className="section-copy">
              Interpret the entered wall-clock time as either UTC or Local, choose seconds or milliseconds, and copy the
              latest valid output.
            </p>
          </div>
          <div className={styles.guidance}>
            <span className={styles.guidanceTitle}>Timezone interpretation is explicit</span>
            <p className={styles.guidanceCopy}>
              The same wall-clock time maps to a different timestamp in UTC and Local mode, so the selected interpretation
              stays visible in the generated result.
            </p>
          </div>
        </div>

        <form className={styles.form} noValidate onSubmit={handleGenerateSubmit}>
          <FormField
            error={generateFieldErrors.dateTime?.[0]}
            hint="The browser-native control includes seconds precision when available."
            htmlFor="timestamp-date-time"
            label="Date and time"
            required
          >
            <input
              aria-describedby={getDescribedBy('timestamp-date-time', generateFieldErrors.dateTime?.[0])}
              id="timestamp-date-time"
              onChange={(event) => updateGenerateDraft('dateTime', event.target.value)}
              step={1}
              type="datetime-local"
              value={generateDraft.dateTime}
            />
          </FormField>

          <div className={styles.grid}>
            <FormField
              error={generateFieldErrors.timezone?.[0]}
              hint="Choose how the entered wall-clock time should be interpreted."
              htmlFor="timestamp-timezone"
              label="Timezone"
              required
            >
              <select
                aria-describedby={getDescribedBy('timestamp-timezone', generateFieldErrors.timezone?.[0])}
                id="timestamp-timezone"
                onChange={(event) => updateGenerateDraft('timezone', event.target.value as TimestampGenerateDraft['timezone'])}
                value={generateDraft.timezone}
              >
                {timestampTimezoneModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode === 'utc' ? 'UTC' : 'Local'}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              error={generateFieldErrors.outputUnit?.[0]}
              hint="Match the API or log format you need to paste into."
              htmlFor="timestamp-output-unit"
              label="Output unit"
              required
            >
              <select
                aria-describedby={getDescribedBy('timestamp-output-unit', generateFieldErrors.outputUnit?.[0])}
                id="timestamp-output-unit"
                onChange={(event) => updateGenerateDraft('outputUnit', event.target.value as TimestampGenerateDraft['outputUnit'])}
                value={generateDraft.outputUnit}
              >
                {timestampOutputUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {formatLabel(unit)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className={styles.actions}>
            <Button disabled={isGenerating} type="submit">
              {isGenerating ? 'Generating timestamp...' : 'Generate timestamp'}
            </Button>
          </div>
        </form>

        <ResultPanel
          copyFeedback={copyFeedback}
          onCopy={generateResult.state === 'valid' && generateResult.value ? handleCopy : undefined}
          resultLabel="Generated timestamp"
          state={generateResult.state === 'valid' && !generateResult.value ? 'idle' : generateResult.state}
          statusDescription={
            generatedDetails
              ? `Interpreted as ${generatedDetails.interpretedAs === 'utc' ? 'UTC' : 'Local'} and returned in ${generatedDetails.outputUnit}.`
              : undefined
          }
          statusTitle={generateResult.message}
          value={generateResult.value}
        />

        <section aria-label="Generated timestamp details" className={styles.details}>
          <div className="section-heading">
            <span className="section-eyebrow">Details</span>
            <h2>Canonical UTC output</h2>
          </div>
          <dl className={styles.detailList}>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Interpreted as</dt>
              <dd className={styles.detailValue}>
                {generatedDetails ? (generatedDetails.interpretedAs === 'utc' ? 'UTC' : 'Local') : 'No generated timestamp yet.'}
              </dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>UTC date and time</dt>
              <dd className={`${styles.detailValue} ${styles.mono}`}>{generatedDetails?.utcDateTime ?? 'Submit a date and time to populate this value.'}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>ISO 8601</dt>
              <dd className={`${styles.detailValue} ${styles.mono}`}>{generatedDetails?.iso8601 ?? 'Submit a date and time to populate this value.'}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Epoch milliseconds</dt>
              <dd className={`${styles.detailValue} ${styles.mono}`}>{generatedDetails?.epochMilliseconds ?? 'Submit a date and time to populate this value.'}</dd>
            </div>
          </dl>
        </section>
      </section>
    </div>
  );
}
