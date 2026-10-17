import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vote Wallet | Electoral Commission & Auditor Operations Portal',
  description: 'National digital voting commission console: voter enrollment, election lifecycle, Shamir key ceremony, and immutable Merkle audit ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-slate-900 antialiased selection:bg-amber-300 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
