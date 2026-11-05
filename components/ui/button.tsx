import type { ComponentProps } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "link"
  | "linkDanger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60";

// Change colors and shapes here and every button in the app follows.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700",
  secondary:
    "rounded-lg border border-gray-300 bg-white font-medium text-gray-900 hover:bg-gray-50",
  danger: "rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700",
  link: "font-medium text-blue-700 hover:underline",
  linkDanger: "font-medium text-red-600 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

type StyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

/** Same look for links that should appear as buttons (e.g. next/link). */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: StyleOptions = {}) {
  const isLink = variant === "link" || variant === "linkDanger";

  return [
    BASE,
    VARIANTS[variant],
    isLink ? "text-sm" : SIZES[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export type ButtonProps = ComponentProps<"button"> &
  StyleOptions & {
    loading?: boolean;
    loadingText?: string;
  };

export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  loadingText,
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
