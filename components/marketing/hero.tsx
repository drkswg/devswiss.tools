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
        <div className={`section-heading ${styles.heading}`}>
          <h1 className={styles.title}>Your data stays in the browser.</h1>
          <p className={styles.description}>
            DevTools gives you UUID, Base64, XML, hash, and cron utilities without sending inputs to a
            server.
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
    </section>
  );
}
