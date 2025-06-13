import './globals.css';
import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import { Providers } from './providers';

// Configure DM Sans font
const dmSans = DM_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'SAAS AXIMOTRAVO',
  description: 'Votre allié pour une gestion de projets BTP simple, fluide et performante.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}