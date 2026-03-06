'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import '@/styles/globals.css';

export default function GlobalError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="site-shell" style={{ paddingBlock: 'clamp(4rem, 12vw, 8rem)' }}>
          <section className="surface-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <div className="section-heading">
              <span className="section-eyebrow">Global Error</span>
              <h1>Something interrupted the DevTools workspace.</h1>
              <p className="section-copy">
                Refresh the state and try again. If the problem persists, reload the page and retry the
                previous action.
              </p>
            </div>
            {error.digest ? (
              <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                Error reference: <code>{error.digest}</code>
              </p>
            ) : null}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button onClick={() => reset()}>Try again</Button>
              <Button href="/" tone="neutral" variant="ghost">
                Back to home
              </Button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
