import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto px-4 py-32 text-center">
      <h1 className="font-playfair text-6xl font-bold text-charcoal mb-4">404</h1>
      <p className="text-charcoal-light mb-8 text-lg">Cette page n&apos;existe pas.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:underline"
      >
        ← Retour à l&apos;accueil
      </Link>
    </div>
  );
}
