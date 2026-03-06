'use client';

import { useMemo, useState } from 'react';
import { DatabaseZap, ShieldCheck } from 'lucide-react';

import { ResultPanel } from '@/components/tools/shared/result-panel';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import type { FieldErrors } from '@/lib/validation/common';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import { defaultUuidNamespace, generateUuid, validateUuidValue, type UuidProcessorResult } from '@/lib/tools/processors/uuid';
import { supportedUuidVersions, type SupportedUuidVersion, type UuidMode } from '@/lib/validation/uuid';

import styles from './uuid-tool.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const versionLabels: Record<SupportedUuidVersion, string> = {
  v1: 'UUID v1',
  v3: 'UUID v3',
  v4: 'UUID v4',
  v5: 'UUID v5',
  v7: 'UUID v7'
};

const idleResult: UuidProcessorResult = {
  state: 'valid',
  message: 'Choose a UUID action to populate this panel.'
};

function getDescribedBy(fieldId: string, hasHint: boolean, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function UuidTool() {
  const [mode, setMode] = useState<UuidMode>('generate');
  const [version, setVersion] = useState<SupportedUuidVersion>('v4');
  const [namespace, setNamespace] = useState(defaultUuidNamespace);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<UuidProcessorResult>(idleResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);

  const requiresNamespace = version === 'v3' || version === 'v5';
  const submitLabel = mode === 'generate' ? 'Generate UUID' : 'Validate UUID';
  const helperTone = result.state === 'valid' && result.version && (result.version === 'v3' || result.version === 'v5') ? 'warning' : undefined;
  const statusDescription = useMemo(() => {
    if (result.state !== 'valid') {
      return undefined;
    }

    if (mode === 'generate' && requiresNamespace) {
      return 'Namespace-based UUIDs are deterministic: the same namespace and name generate the same value.';
    }

    return undefined;
  }, [mode, requiresNamespace, result.state]);

  const handleModeChange = (nextMode: UuidMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setCopyFeedback(null);
    setResult(idleResult);
  };

  async function handleCopy() {
    const copiedValue = result.value ?? '';
    const copyResult = await copyTextToClipboard(copiedValue);

    if (copyResult.ok) {
      setCopyFeedback({
        tone: 'success',
        title: 'Copied to clipboard',
        description: 'The current UUID is ready to paste.'
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

    const nextResult =
      mode === 'generate'
        ? generateUuid({
            mode,
            version,
            namespace,
            name
          })
        : validateUuidValue({
            mode,
            value
          });

    setFieldErrors(nextResult.fieldErrors ?? {});
    setResult(nextResult);
    setCopyFeedback(null);
  }

  return (
    <div className={styles.layout}>
      <section className={`surface-card ${styles.panel}`}>
        <div className={styles.panelHeader}>
          <div className="section-heading">
            <span className="section-eyebrow">UUID workflow</span>
            <h2>{mode === 'generate' ? 'Generate a versioned UUID' : 'Validate a pasted UUID'}</h2>
            <p className="section-copy">
              DevTools keeps UUID generation and validation in-browser, with clear state handling for valid,
              invalid, and empty inputs.
            </p>
          </div>
          <div className={styles.modeSwitch} role="group" aria-label="UUID action">
            <Button
              aria-pressed={mode === 'generate'}
              onClick={() => handleModeChange('generate')}
              variant={mode === 'generate' ? 'solid' : 'ghost'}
              tone={mode === 'generate' ? 'accent' : 'neutral'}
            >
              <DatabaseZap aria-hidden size={16} />
              Generate
            </Button>
            <Button
              aria-pressed={mode === 'validate'}
              onClick={() => handleModeChange('validate')}
              variant={mode === 'validate' ? 'solid' : 'ghost'}
              tone={mode === 'validate' ? 'accent' : 'neutral'}
            >
              <ShieldCheck aria-hidden size={16} />
              Validate
            </Button>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'generate' ? (
            <>
              <FormField htmlFor="uuid-version" hint="Versions 3 and 5 require namespace and name inputs." label="UUID version">
                <select id="uuid-version" onChange={(event) => setVersion(event.target.value as SupportedUuidVersion)} value={version}>
                  {supportedUuidVersions.map((item) => (
                    <option key={item} value={item}>
                      {versionLabels[item]}
                    </option>
                  ))}
                </select>
              </FormField>

              {requiresNamespace ? (
                <div className={styles.splitFields}>
                  <FormField
                    error={fieldErrors.namespace?.[0]}
                    hint="Default namespace starts with the DNS UUID. Replace it with any valid UUID namespace."
                    htmlFor="uuid-namespace"
                    label="Namespace UUID"
                    required
                  >
                    <input
                      aria-describedby={getDescribedBy('uuid-namespace', true, fieldErrors.namespace?.[0])}
                      id="uuid-namespace"
                      onChange={(event) => setNamespace(event.target.value)}
                      placeholder={defaultUuidNamespace}
                      value={namespace}
                    />
                  </FormField>

                  <FormField
                    error={fieldErrors.name?.[0]}
                    hint="The same namespace and name always produce the same UUID."
                    htmlFor="uuid-name"
                    label="Name"
                    required
                  >
                    <input
                      aria-describedby={getDescribedBy('uuid-name', true, fieldErrors.name?.[0])}
                      id="uuid-name"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="service.devtools.local"
                      value={name}
                    />
                  </FormField>
                </div>
              ) : null}
            </>
          ) : (
            <FormField
              error={fieldErrors.value?.[0]}
              hint="Paste a UUID version 1, 3, 4, 5, or 7."
              htmlFor="uuid-value"
              label="UUID value"
              required
            >
              <textarea
                aria-describedby={getDescribedBy('uuid-value', true, fieldErrors.value?.[0])}
                id="uuid-value"
                onChange={(event) => setValue(event.target.value)}
                placeholder="018f8ce1-20dd-7f48-a78a-bb4f80b2c5fb"
                rows={4}
                value={value}
              />
            </FormField>
          )}

          <div className={styles.actions}>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </section>

      <ResultPanel
        copyFeedback={copyFeedback}
        onCopy={result.state === 'valid' && result.value ? handleCopy : undefined}
        resultLabel="UUID result"
        state={result.state === 'valid' && !result.value ? 'idle' : result.state}
        statusDescription={statusDescription}
        statusTitle={result.message}
        tone={helperTone}
        value={result.value}
      />
    </div>
  );
}
