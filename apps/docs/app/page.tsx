import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-12">
      <h1 className="text-5xl font-bold text-[var(--color-neutral-900)]">ID-Components</h1>
      <p className="max-w-md text-center text-lg text-[var(--color-neutral-600)]">
        GSAP-native React components with motion personality.
      </p>
      <Link
        href="/docs"
        className="rounded-[var(--radius-md)] bg-[var(--color-accent-600)] px-6 py-3 font-medium text-white hover:bg-[var(--color-accent-700)]"
      >
        Read the docs →
      </Link>
    </main>
  );
}
