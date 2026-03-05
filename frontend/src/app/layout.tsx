import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import AppShell from '@/features/layouts/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'poc-purchasing-approval',
  description: '購買申請・承認 PoC',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // TODO: 後で auth 実装に置き換え（cookie / session / middleware など）
  const isAuthed = true;

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppShell isAuthed={isAuthed}>{children}</AppShell>
      </body>
    </html>
  );
}
