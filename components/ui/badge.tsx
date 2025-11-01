"use client";

import classNames from "classnames";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium";
  const styles: Record<string, string> = {
    default: "bg-black text-white",
    outline: "border border-neutral-300 text-neutral-700",
    secondary: "bg-neutral-100 text-neutral-700",
  };
  return <span className={classNames(base, styles[variant], className)}>{children}</span>;
}

export default Badge;
