import "./globals.css";
import type { Metadata } from 'next';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

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
    <ClerkProvider>
      <html lang="en">
        <body>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <header className="fixed top-0 right-0 p-4 z-50">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
