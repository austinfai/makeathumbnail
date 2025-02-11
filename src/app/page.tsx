import { Metadata } from "next";
import { SignUpButtonClient } from "./components/SignUpButtonClient";

export const metadata: Metadata = {
  title: 'Make A Thumbnail AI - Create Beautiful Images',
  description: 'Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.',
  openGraph: {
    title: 'Make A Thumbnail AI - Create Beautiful Images',
    description: 'Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-gradient">
          Make A Thumbnail AI
        </h1>
        <div className="text-2xl font-bold text-red-500 animate-pulse">
          COMING SOON
        </div>
        <p className="text-xl text-gray-300 max-w-xl mx-auto">
          Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.
        </p>
        <div className="mt-10">
          <SignUpButtonClient />
        </div>
      </div>
    </div>
  );
}
