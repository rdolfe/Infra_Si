"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-charcoal font-inter"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={[
            "rounded-md border px-3 py-2 text-sm text-charcoal bg-white font-inter",
            "placeholder:text-charcoal-light/60",
            "focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta",
            "disabled:opacity-50 disabled:bg-stone-100 disabled:cursor-not-allowed",
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-stone-200",
            className,
          ].join(" ")}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-charcoal-light">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
