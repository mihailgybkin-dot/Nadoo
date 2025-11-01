import React from "react";
import cn from "classnames";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return (
    <div className={cn("rounded-lg border bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: Props) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export default Card;
