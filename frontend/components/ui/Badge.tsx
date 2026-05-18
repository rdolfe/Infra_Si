type DpeRating = "A" | "B" | "C" | "D" | "E" | "F" | "G";

const dpeColors: Record<DpeRating, string> = {
  A: "bg-green-600 text-white",
  B: "bg-green-500 text-white",
  C: "bg-lime-500 text-white",
  D: "bg-yellow-400 text-charcoal",
  E: "bg-orange-400 text-white",
  F: "bg-orange-600 text-white",
  G: "bg-red-600 text-white",
};

interface DpeBadgeProps {
  rating: string;
}

export function DpeBadge({ rating }: DpeBadgeProps) {
  const upper = rating.toUpperCase() as DpeRating;
  const colorClass = dpeColors[upper] ?? "bg-stone-200 text-charcoal";
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold font-inter ${colorClass}`}
      aria-label={`DPE ${upper}`}
    >
      {upper}
    </span>
  );
}

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-stone-100 text-charcoal",
  success: "bg-sage-light/20 text-sage-dark border border-sage",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  error: "bg-red-100 text-red-700 border border-red-300",
  info: "bg-blue-100 text-blue-700 border border-blue-300",
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ label, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-inter ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
