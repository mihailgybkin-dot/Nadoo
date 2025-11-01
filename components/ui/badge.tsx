// components/ui/badge.tsx
import React from "react";
import cn from "classnames";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "accent";
};

export function Badge({ className, variant = "default", ...props }: Props) {
  const classes = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    {
      // базовые стили (можешь настроить под Tailwind)
      "bg-neutral-900 text-white": variant === "default",
      "bg-neutral-200 text-neutral-900": variant === "secondary",
      "border border-neutral-300 text-neutral-700": variant === "outline",
      "bg-blue-600 text-white": variant === "accent"
    },
    className
  );

  return <span className={classes} {...props} />;
}

export default Badge;
