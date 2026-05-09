import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { siteMetadata, siteViewport } from '@/lib/tools/metadata';
import '@/styles/globals.css';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

const googleAnalyticsId = 'G-3MPK36KWDV';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body>{children}</body>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${googleAnalyticsId}');
        `}
      </Script>
    </html>
  );
}
