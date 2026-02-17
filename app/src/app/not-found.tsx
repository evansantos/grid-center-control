import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <p className="text-xl text-zinc-400">Page not found</p>
        <Link href="/" className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
