import "./globals.css";
import type { Metadata } from 'next';

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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://makeathumbnail.com',
    siteName: 'Make A Thumbnail',
    title: 'Make A Thumbnail - Create Beautiful Images',
    description: 'Create beautiful thumbnails and images with AI-powered generation and editing tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Make A Thumbnail Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Make A Thumbnail - Create Beautiful Images',
    description: 'Create beautiful thumbnails and images with AI-powered generation and editing tools.',
    images: ['/twitter-image.png'],
    creator: '@makeathumbnail',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
