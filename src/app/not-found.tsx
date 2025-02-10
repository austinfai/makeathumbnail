import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-600">Not Found</h2>
        <p className="mt-2 text-gray-500">Could not find requested resource</p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
} 