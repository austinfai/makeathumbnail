import type { Metadata } from 'next';
import ImageGenerator from './components/ImageGenerator';

export const metadata: Metadata = {
  title: 'Create Images',
  description: 'Generate and customize beautiful images using AI-powered tools.',
  openGraph: {
    title: 'Create Images - Make A Thumbnail',
    description: 'Generate and customize beautiful images using AI-powered tools.',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <ImageGenerator />
    </main>
  );
}
