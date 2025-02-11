import "./globals.css";
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Make A Thumbnail',
    default: 'Make A Thumbnail - Create Beautiful Images',
  },
  description: 'Create beautiful thumbnails and images with AI-powered generation and editing tools.',
  keywords: ['thumbnail generator', 'AI image generation', 'image editor', 'text overlay'],
  authors: [{ name: 'Make A Thumbnail' }],
  creator: 'Make A Thumbnail',
  publisher: 'Make A Thumbnail',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
