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
  title: MAINTENANCE_CONFIG.enabled ? 'SAAS AXIMOTRAVO - Maintenance en cours' : 'SAAS AXIMOTRAVO',
  description: MAINTENANCE_CONFIG.enabled 
    ? 'Site temporairement indisponible pour maintenance. Nous effectuons des améliorations et serons bientôt de retour.'
    : 'Votre allié pour une gestion de projets BTP simple, fluide et performante.',
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