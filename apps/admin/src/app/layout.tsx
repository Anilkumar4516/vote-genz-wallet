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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
