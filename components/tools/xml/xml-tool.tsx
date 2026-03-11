'use client';

import { useRef, useState } from 'react';
import { Braces, Copy, Download, FileUp, WandSparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { StatusMessage } from '@/components/ui/status-message';
import { transformXml, type XmlOutputKind } from '@/lib/tools/processors/xml';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import { downloadTextFile, readTextFile } from '@/lib/utils/file';
import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import { type XmlIndentSize, type XmlTransformMode } from '@/lib/validation/xml';

import styles from './xml-tool.module.css';

type Feedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

type OutputSnapshot = {
  kind: XmlOutputKind;
  value: string;
};

const idleStatus = {
  state: 'idle' as ValidationState,
  message: 'Run format, minify, or XML to JSON to populate the output pane.'
};

function resolveTone(state: ValidationState): 'error' | 'info' | 'success' | 'warning' {
  if (state === 'valid') {
    return 'success';
  }

  if (state === 'invalid' || state === 'error') {
    return 'error';
  }

  return 'info';
}

export function XmlTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [indentSize, setIndentSize] = useState<XmlIndentSize>(2);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState(idleStatus);
  const [output, setOutput] = useState<OutputSnapshot | null>(null);
  const [sourceFeedback, setSourceFeedback] = useState<Feedback | null>(null);
  const [outputFeedback, setOutputFeedback] = useState<Feedback | null>(null);
  const [activeAction, setActiveAction] = useState<XmlTransformMode | null>(null);

  function clearInputError() {
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next.inputValue;
      return next;
    });
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    clearInputError();
    setSourceFeedback(null);
  }

  function runTransform(mode: XmlTransformMode) {
    setActiveAction(mode);

    try {
      const result = transformXml({ inputValue, indentSize, mode });

      setFieldErrors(result.fieldErrors ?? {});
      setStatus({
        state: result.state,
        message: result.message
      });
      setOutputFeedback(null);

      if (result.state === 'valid' && result.value && result.outputKind) {
        setOutput({
          kind: result.outputKind,
          value: result.value
        });
      }
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCopySource() {
    const copyResult = await copyTextToClipboard(inputValue);

    setSourceFeedback(
      copyResult.ok
        ? {
            tone: 'success',
            title: 'Copied source XML',
            description: 'The original XML is ready to paste.'
          }
        : {
            tone: 'error',
            title: copyResult.reason === 'empty' ? 'Nothing to copy' : 'Copy unavailable',
            description:
              copyResult.reason === 'blocked'
                ? 'The browser blocked clipboard access. Copy the XML manually.'
                : copyResult.reason === 'empty'
                  ? 'Enter or upload XML before copying the source pane.'
                  : 'Clipboard access is not available in this environment.'
          }
    );
  }

  async function handleCopyOutput() {
    const copyResult = await copyTextToClipboard(output?.value ?? '');

    setOutputFeedback(
      copyResult.ok
        ? {
            tone: 'success',
            title: 'Copied transformed output',
            description: 'The transformed result is ready to paste.'
          }
        : {
            tone: 'error',
            title: copyResult.reason === 'empty' ? 'Nothing to copy' : 'Copy unavailable',
            description:
              copyResult.reason === 'blocked'
                ? 'The browser blocked clipboard access. Copy the output manually.'
                : copyResult.reason === 'empty'
                  ? 'Run a transform before copying the output pane.'
                  : 'Clipboard access is not available in this environment.'
          }
    );
  }

  function handleDownload() {
    const downloadResult = downloadTextFile('formatted.xml', output?.value ?? '');

    setOutputFeedback(
      downloadResult.ok
        ? {
            tone: 'success',
            title: 'Downloaded XML result',
            description: 'The transformed XML was downloaded as formatted.xml.'
          }
        : {
            tone: 'error',
            title: downloadResult.reason === 'empty' ? 'Nothing to download' : 'Download unavailable',
            description:
              downloadResult.reason === 'empty'
                ? 'Run a format or minify action before downloading XML.'
                : 'File download is not available in this environment.'
          }
    );
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const text = await readTextFile(file);
      setInputValue(text);
      clearInputError();
      setSourceFeedback({
        tone: 'success',
        title: 'XML file loaded',
        description: `${file.name} is ready in the source pane.`
      });
    } catch {
      setSourceFeedback({
        tone: 'error',
        title: 'Upload failed',
        description: 'The selected file could not be read as text.'
      });
    }
  }

  const outputLabel = output?.kind === 'json' ? 'JSON output' : 'XML output';

  return (
    <div className={styles.layout}>
      <section aria-label="XML source workflow" className={`surface-card ${styles.pane}`}>
        <div className={styles.paneHeader}>
          <div className="section-heading">
            <span className="section-eyebrow">Source XML</span>
            <h2>Paste XML or load it from a file</h2>
            <p className="section-copy">
              Keep the original document on the left, then choose an explicit action to format, minify, or convert it.
            </p>
          </div>
        </div>

        <div className={styles.paneToolbar}>
          <Button onClick={() => fileInputRef.current?.click()} tone="neutral" variant="outline">
            <FileUp aria-hidden size={16} />
            Upload XML
          </Button>
          <Button onClick={handleCopySource} tone="neutral" variant="ghost">
            <Copy aria-hidden size={16} />
            Copy source
          </Button>
          <input
            accept=".xml,text/xml,application/xml"
            className={styles.fileInput}
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <div className={styles.editorRegion}>
          <FormField
            error={fieldErrors.inputValue?.[0]}
            hint="Malformed XML stays in place so you can correct it without losing the last valid result."
            htmlFor="xml-source"
            label="Original XML"
            required
          >
            <textarea
              aria-describedby={fieldErrors.inputValue?.[0] ? 'xml-source-error xml-source-hint' : 'xml-source-hint'}
              className={`${styles.textarea} ${styles.editorTextarea}`}
              id="xml-source"
              onChange={(event) => handleInputChange(event.target.value)}
              placeholder="<root><item id=&quot;1&quot;>value</item></root>"
              rows={18}
              spellCheck={false}
              value={inputValue}
            />
          </FormField>
        </div>

        <div className={styles.supportStack}>
          <div className={styles.metaRow}>
            <FormField
              hint="Indentation only applies to the format action."
              htmlFor="xml-indent"
              label="Format indentation"
            >
              <select
                className={styles.indentField}
                id="xml-indent"
                onChange={(event) => setIndentSize(Number(event.target.value) as XmlIndentSize)}
                value={String(indentSize)}
              >
                <option value="2">2 spaces</option>
                <option value="3">3 spaces</option>
                <option value="4">4 spaces</option>
              </select>
            </FormField>
          </div>

          <div className={styles.buttonGroup}>
            <Button disabled={activeAction !== null} onClick={() => runTransform('format')}>
              <WandSparkles aria-hidden size={16} />
              {activeAction === 'format' ? 'Formatting…' : 'Format XML'}
            </Button>
            <Button disabled={activeAction !== null} onClick={() => runTransform('minify')} variant="outline">
              <Braces aria-hidden size={16} />
              {activeAction === 'minify' ? 'Minifying…' : 'Minify XML'}
            </Button>
            <Button disabled={activeAction !== null} onClick={() => runTransform('convert')} tone="neutral" variant="ghost">
              <Braces aria-hidden size={16} />
              {activeAction === 'convert' ? 'Converting…' : 'XML to JSON'}
            </Button>
          </div>

          {sourceFeedback ? (
            <StatusMessage title={sourceFeedback.title} tone={sourceFeedback.tone}>
              {sourceFeedback.description ? <p>{sourceFeedback.description}</p> : null}
            </StatusMessage>
          ) : null}
        </div>
      </section>

      <section aria-label="XML output workflow" className={`surface-card ${styles.pane}`}>
        <div className={styles.paneHeader}>
          <div className="section-heading">
            <span className="section-eyebrow">Transformed output</span>
            <h2>Review the latest XML or JSON result</h2>
            <p className="section-copy">
              The right pane keeps the last valid result available for copy. XML downloads stay available only for XML output.
            </p>
          </div>
        </div>

        <div className={styles.paneToolbar}>
          <Button disabled={!output?.value} onClick={handleCopyOutput} tone="neutral" variant="ghost">
            <Copy aria-hidden size={16} />
            Copy output
          </Button>
          {output?.kind === 'xml' && output.value ? (
            <Button onClick={handleDownload} tone="neutral" variant="outline">
              <Download aria-hidden size={16} />
              Download XML
            </Button>
          ) : null}
        </div>

        <div className={styles.editorRegion}>
          <FormField
            hint={output ? `Current output type: ${outputLabel}.` : 'No result yet. Submit an action from the source pane.'}
            htmlFor="xml-output"
            label="Transformed output"
          >
            <textarea
              className={`${styles.textarea} ${styles.editorTextarea}`}
              id="xml-output"
              placeholder="Formatted XML or JSON will appear here."
              readOnly
              rows={18}
              spellCheck={false}
              value={output?.value ?? ''}
            />
          </FormField>
        </div>

        <div className={styles.supportStack}>
          <StatusMessage title={status.message} tone={resolveTone(status.state)}>
            <p>{output?.kind === 'json' ? 'The latest result is JSON text.' : 'The latest result is XML text.'}</p>
          </StatusMessage>
          {outputFeedback ? (
            <StatusMessage title={outputFeedback.title} tone={outputFeedback.tone}>
              {outputFeedback.description ? <p>{outputFeedback.description}</p> : null}
            </StatusMessage>
          ) : null}
        </div>
      </section>
    </div>
  );
}
