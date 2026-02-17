import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono text-center px-4">
      <div className="text-6xl mb-6">📁</div>
      <h1 className="text-2xl font-bold mb-2 text-[--grid-text]">Project Not Found</h1>
      <p className="text-sm text-[--grid-text-dim] mb-8 max-w-md">
        The project you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="px-6 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'var(--grid-accent)', color: '#fff' }}
      >
        ← Back to Projects
      </Link>
    </div>
  );
}
