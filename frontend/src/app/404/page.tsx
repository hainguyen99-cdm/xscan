'use client';

export const dynamic = 'force-dynamic';

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-900">404 - Page Not Found</h1>
        <p className="mt-2 text-gray-600">The page you requested could not be found.</p>
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


