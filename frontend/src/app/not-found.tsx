'use client';

export const dynamic = 'force-dynamic';

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          aria-label="Go back home"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

'use client';
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a 
          href="/" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
