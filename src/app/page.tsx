import type { Metadata } from 'next';
import ImageGeneratorSimple from './components/ImageGeneratorSimple';

export const metadata: Metadata = {
  title: 'Make A Thumbnail AI - Create Beautiful Images',
  description: 'Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.',
  openGraph: {
    title: 'Make A Thumbnail AI',
    description: 'Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <ImageGeneratorSimple />
    </main>
  );
}
