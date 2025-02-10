import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">The requested resource could not be found</p>
        <a href="/" className="text-indigo-600 hover:text-indigo-800">
          Return Home
        </a>
      </div>
    </div>
  );
} 