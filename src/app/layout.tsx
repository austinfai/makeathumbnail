import "./globals.css";
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Get the publishable key from environment
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Validate the environment variable
if (!publishableKey) {
  throw new Error(
    'Missing publishableKey environment variable. ' +
    'This is needed for authentication to work. ' +
    'Add it to your .env.local file or Vercel environment variables.'
  );
}

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
    <ClerkProvider 
      publishableKey={publishableKey}
    >
      <html lang="en" className={inter.className}>
        <body className="min-h-screen bg-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
