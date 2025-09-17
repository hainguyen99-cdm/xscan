'use client';

export const dynamic = 'force-dynamic';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps): JSX.Element {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-gray-600">{error?.message || 'Unexpected error.'}</p>
            <button
              onClick={reset}
              className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              aria-label="Try again"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
