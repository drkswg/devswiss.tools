import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Not found',
  description: 'The requested devswiss.tools page could not be found.'
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="site-shell" style={{ paddingBlock: 'clamp(4rem, 12vw, 8rem)' }}>
          <section className="surface-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <div className="section-heading">
              <span className="section-eyebrow">404</span>
              <h1>This devswiss.tools route does not exist.</h1>
              <p className="section-copy">
                Return to the catalog and pick one of the available tools. Unmatched routes are handled by
                the global 404 boundary.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Button href="/">Open the catalog</Button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
