import "./globals.css";
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "@/utils/uploadthing";
import { ourFileRouter } from "./api/uploadthing/core";
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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://makeathumbnail.ai',
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
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <body>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
