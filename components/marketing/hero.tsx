import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import styles from './hero.module.css';

export function Hero() {
  return (
    <section className={`surface-card ${styles.hero}`}>
      <div className={styles.copy}>
        <div className={styles.badge}>
          <Sparkles aria-hidden size={16} />
          Browser-first developer tools
        </div>
        <div className="section-heading">
          <h1 className={styles.title}>DevTools keeps common developer utilities fast, local, and readable.</h1>
          <p className={styles.description}>
            Generate and validate UUIDs, transform Base64 text, create hashes, and grow into more tools
            without redesigning the catalog.
          </p>
        </div>
        <div className={styles.actions}>
          <Button href="/tools/uuid">
            Open UUID tool
            <ArrowRight aria-hidden size={16} />
          </Button>
          <Button href="#tool-catalog" tone="neutral" variant="ghost">
            Browse all tools
          </Button>
        </div>
      </div>

      <div className={styles.highlights}>
        <div className={styles.highlightCard} data-accent="orange">
          <span className={styles.highlightLabel}>Local processing</span>
          <strong>Inputs stay in the browser.</strong>
          <p>No server round-trip for UUID, Base64, or hash workflows.</p>
        </div>
        <div className={styles.highlightCard} data-accent="blue">
          <span className={styles.highlightLabel}>Tile-based catalog</span>
          <strong>Large icons, direct access.</strong>
          <p>The same registry drives homepage discovery and route-level metadata.</p>
        </div>
        <div className={styles.highlightCard} data-accent="green">
          <span className={styles.highlightLabel}>Future-ready</span>
          <strong>Add the next tool without layout churn.</strong>
          <p>The catalog stays consistent as the suite expands.</p>
        </div>
      </div>
    </section>
  );
}
