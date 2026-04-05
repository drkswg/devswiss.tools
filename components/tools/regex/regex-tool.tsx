'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { StatusMessage } from '@/components/ui/status-message';
import { analyzeRegex, type RegexProcessorResult } from '@/lib/tools/processors/regex';
import type { FieldErrors } from '@/lib/validation/common';
import { emptyRegexDraft, regexFlavors, type RegexDraft, type RegexFlavor } from '@/lib/validation/regex';

import styles from './regex-tool.module.css';

const flavorLabels: Record<RegexFlavor, string> = {
  java: 'Java',
  plsql: 'PL/SQL'
};

const idleResult: RegexProcessorResult = {
  state: 'valid',
  message: 'Choose a flavor, submit a pattern, and inspect the explanation and match details.'
};

function getDescribedBy(fieldId: string, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function RegexTool() {
  const [draft, setDraft] = useState<RegexDraft>(emptyRegexDraft);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<RegexProcessorResult>(idleResult);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateDraft<K extends keyof RegexDraft>(key: K, value: RegexDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([field]) => field !== key)));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextResult = analyzeRegex(draft);
      setFieldErrors(nextResult.fieldErrors ?? {});
      setResult(nextResult);
    } finally {
      setIsSubmitting(false);
    }
  }

  const details = result.details;
  const execution = details?.execution;
  const hasMatches = execution?.supported ? execution.matches.length > 0 : false;

  return (
    <section aria-label="Regex tester workflow" className={`surface-card ${styles.panel}`}>
      <div className={styles.header}>
        <div className="section-heading">
          <span className="section-eyebrow">Regex workflow</span>
          <h2>Explain flavor-specific expressions and test them against sample text</h2>
          <p className="section-copy">
            Choose Java or PL/SQL, submit a pattern and sample text together, and keep explanation output separate from
            match details.
          </p>
        </div>
        <div className={styles.guidance}>
          <span className={styles.guidanceTitle}>Execution stays honest about flavor limits</span>
          <p className={styles.guidanceCopy}>
            The explanation layer can describe more syntax than the browser can execute exactly, so unsupported constructs
            stay visible with explicit warnings instead of misleading matches.
          </p>
        </div>
      </div>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <FormField
          error={fieldErrors.flavor?.[0]}
          hint="Java and PL/SQL use different regex features, so choose the flavor before analyzing."
          htmlFor="regex-flavor"
          label="Regex flavor"
          required
        >
          <select
            aria-describedby={getDescribedBy('regex-flavor', fieldErrors.flavor?.[0])}
            id="regex-flavor"
            onChange={(event) => updateDraft('flavor', event.target.value as RegexFlavor)}
            value={draft.flavor}
          >
            {regexFlavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavorLabels[flavor]}
              </option>
            ))}
          </select>
        </FormField>

        <div className={styles.formGrid}>
          <FormField
            error={fieldErrors.expression?.[0]}
            hint="Enter the raw flavor-specific pattern. Leading inline flags such as `(?i)` are supported when execution is safe."
            htmlFor="regex-expression"
            label="Regex expression"
            required
          >
            <textarea
              aria-describedby={getDescribedBy('regex-expression', fieldErrors.expression?.[0])}
              id="regex-expression"
              onChange={(event) => updateDraft('expression', event.target.value)}
              placeholder="^(?i)([A-Z]{3})-(\\d+)$"
              rows={8}
              value={draft.expression}
            />
          </FormField>

          <FormField
            error={fieldErrors.sampleText?.[0]}
            hint="Sample text can be empty when you want to test anchors or optional branches."
            htmlFor="regex-sample"
            label="Sample text"
          >
            <textarea
              aria-describedby={getDescribedBy('regex-sample', fieldErrors.sampleText?.[0])}
              id="regex-sample"
              onChange={(event) => updateDraft('sampleText', event.target.value)}
              placeholder="ABC-42"
              rows={8}
              value={draft.sampleText}
            />
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Analyzing regex...' : 'Analyze regex'}
          </Button>
        </div>
      </form>

      <div className={styles.results}>
        <section aria-label="Regex explanation" className={styles.resultCard}>
          <div className="section-heading">
            <span className="section-eyebrow">Explanation</span>
            <h2>Pattern breakdown</h2>
          </div>

          <StatusMessage
            title={result.message}
            tone={details?.warnings.length ? 'warning' : result.state === 'valid' ? 'success' : 'error'}
          >
            {details ? <p>{details.flavor === 'java' ? 'Java' : 'PL/SQL'} analysis stays deterministic for the supported subset.</p> : null}
          </StatusMessage>

          <p className={styles.summary}>{details?.summary ?? 'Submit a pattern to generate a flavor-aware summary.'}</p>

          <ol className={styles.list}>
            {(details?.explanation ?? ['No explanation yet. Submit the current pattern to populate this section.']).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          {details?.warnings.length ? (
            <div className={styles.warningList}>
              {details.warnings.map((warning) => (
                <p key={warning} className={styles.warningItem}>
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </section>

        <section aria-label="Regex match details" className={styles.resultCard}>
          <div className="section-heading">
            <span className="section-eyebrow">Match details</span>
            <h2>Sample evaluation</h2>
          </div>

          <StatusMessage
            title={
              execution
                ? execution.supported
                  ? execution.anyMatch
                    ? execution.fullMatch
                      ? 'Sample text contains a full match.'
                      : 'Sample text contains one or more partial matches.'
                    : 'Sample text does not match the current pattern.'
                  : execution.unsupportedReason
                : 'Submit a pattern to evaluate the sample text.'
            }
            tone={execution ? (execution.supported ? (execution.anyMatch ? 'success' : 'info') : 'warning') : 'info'}
          />

          {execution?.supported ? (
            <>
              <dl className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>Any match</dt>
                  <dd className={styles.detailValue}>{execution.anyMatch ? 'Yes' : 'No'}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>Full sample match</dt>
                  <dd className={styles.detailValue}>{execution.fullMatch ? 'Yes' : 'No'}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>Translated browser pattern</dt>
                  <dd className={`${styles.detailValue} ${styles.mono}`}>{execution.translatedPattern}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>Browser flags</dt>
                  <dd className={`${styles.detailValue} ${styles.mono}`}>{execution.flags || '(none)'}</dd>
                </div>
              </dl>

              {hasMatches ? (
                <div className={styles.matches}>
                  {execution.matches.map((match) => (
                    <article key={`${match.index}-${match.start}-${match.end}`} className={styles.matchCard}>
                      <h3 className={styles.matchHeading}>Match {match.index}</h3>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Text</span>
                        <p className={`${styles.detailValue} ${styles.mono}`}>{match.value}</p>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Range</span>
                        <p className={styles.detailValue}>
                          {match.start} to {match.end}
                        </p>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Capture groups</span>
                        {match.groups.length ? (
                          <ol className={styles.groupList}>
                            {match.groups.map((group) => (
                              <li key={`${match.index}-${group.index}`}>
                                Group {group.index}: <span className={styles.mono}>{group.value || '(empty)'}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className={styles.detailValue}>No capture groups for this match.</p>
                        )}
                      </div>
                    </article>
                  ))}
                  {execution.matchLimitReached ? (
                    <p className={styles.warningItem}>Only the first 25 matches are shown to keep the output bounded.</p>
                  ) : null}
                </div>
              ) : (
                <p className={styles.detailValue}>No match rows to show for the current sample text.</p>
              )}
            </>
          ) : (
            <p className={styles.detailValue}>
              {execution?.unsupportedReason ?? 'Submit the current flavor, pattern, and sample text to populate this section.'}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
