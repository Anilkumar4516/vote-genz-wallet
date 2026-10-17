import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ToastProvider } from '../components/ui/Toast';

export const metadata: Metadata = {
  title: 'Vote Wallet | Official National Digital Voting Portal',
  description: 'Confidential, zero-knowledge, and biometric electoral voting portal anchored in cryptographic Merkle audit ledger.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#070b14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-background text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        <ToastProvider>
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
