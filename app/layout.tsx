import './globals.css';
import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import { Providers } from './providers';
import MaintenancePage from '@/components/MaintenancePage';
import { MAINTENANCE_CONFIG } from '@/config/maintenance';

// Configure DM Sans font
const dmSans = DM_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'SAAS AXIMOTRAVO - Maintenance en cours',
  description: 'Site temporairement indisponible pour maintenance. Nous effectuons des améliorations et serons bientôt de retour.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={dmSans.variable} suppressHydrationWarning={true} translate="no">
      <body className={dmSans.className} suppressHydrationWarning={true}>
        <Providers>
          {MAINTENANCE_CONFIG.enabled ? <MaintenancePage /> : children}
        </Providers>
      </body>
    </html>
  );
}