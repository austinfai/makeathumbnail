import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h2>Not Found</h2>
        <p>Could not find requested resource</p>
      </div>
    </div>
  );
} 