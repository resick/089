import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { env } from '@/env';
import { themeCss } from '@/theme-css';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: '089 — München entdecken',
  description: 'Was ist jetzt los in München? Orte, Events und Ideen — kuratiert.',
  // Nothing is public yet; keep every environment out of search indexes.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <style>{themeCss}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
