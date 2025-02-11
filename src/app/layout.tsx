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
  metadataBase: new URL('https://makeathumbnail.vercel.app'),
  other: {
    'cookie-policy': 'This site uses essential cookies for authentication and functionality.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          termsPageUrl: "https://clerk.com/terms"
        },
        elements: {
          formButtonPrimary: 
            "bg-blue-600 hover:bg-blue-700 text-white",
          footerActionLink: 
            "text-blue-600 hover:text-blue-700"
        }
      }}
    >
      <html lang="en" className={inter.className}>
        <head>
          <meta name="cookie-policy" content="This site uses essential cookies for authentication and functionality" />
        </head>
        <body className="min-h-screen bg-black text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
