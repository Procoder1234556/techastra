import { Link } from 'react-router-dom';

export function Unauthorized() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Access Denied</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        You don&apos;t have permission to access this page.
      </p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-neutral-900 px-6 py-2 text-white dark:bg-white dark:text-neutral-900">
        Go Home
      </Link>
    </div>
  );
}
