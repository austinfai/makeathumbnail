import "./globals.css";
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Get the environment variables
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Debug logging for Clerk initialization
console.log('Clerk initialization:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Publishable key exists:', !!publishableKey);
console.log('- Sign-in URL:', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL);
console.log('- Sign-up URL:', process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL);

// Validate environment variables
if (!publishableKey) {
  console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

export const metadata: Metadata = {
  title: {
    template: '%s | Make A Thumbnail AI',
    default: 'Make A Thumbnail AI - Create Beautiful Images',
  },
  description: 'Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.',
  keywords: ['thumbnail generator', 'AI image generation', 'image editor', 'text overlay'],
  authors: [{ name: 'Make A Thumbnail AI' }],
  creator: 'Make A Thumbnail AI',
  publisher: 'Make A Thumbnail AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
        baseTheme: undefined,
        variables: {
          colorPrimary: 'rgb(37 99 235)',
        },
        elements: {
          formButtonPrimary: 
            "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
          footerActionLink: 
            "text-blue-600 hover:text-blue-700",
          card: 
            "bg-white shadow-xl rounded-xl border border-gray-100",
          headerTitle: 
            "text-gray-900 text-xl font-semibold",
          headerSubtitle: 
            "text-gray-600",
          socialButtonsBlockButton: 
            "bg-white border border-gray-200 hover:bg-gray-50 text-black",
          socialButtonsBlockButtonText: 
            "text-gray-600",
          formFieldLabel: 
            "text-gray-700",
          formFieldInput: 
            "text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          footerActionText: 
            "text-gray-600",
          identityPreviewText: 
            "text-gray-600",
          identityPreviewEditButtonIcon: 
            "text-gray-600"
        }
      }}
    >
      <html lang="en" className={inter.className}>
        <body className="min-h-screen bg-black text-white">
          <main className="relative">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
