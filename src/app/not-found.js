export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <h2 className="mt-4 text-2xl font-semibold text-gray-600">Page Not Found</h2>
                <p className="mt-2 text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
                <a
                    href="/"
                    className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
} 