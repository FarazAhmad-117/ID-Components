import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { DocsProviders } from './providers';
import '../globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>
          <DocsProviders>{children}</DocsProviders>
        </RootProvider>
      </body>
    </html>
  );
}
