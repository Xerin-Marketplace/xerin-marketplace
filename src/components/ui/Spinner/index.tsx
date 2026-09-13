"use client";

import { LoaderIcon, type LucideProps } from "lucide-react";

function Spinner({ className, ...props }: LucideProps) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={`size-4 animate-spin ${className || ""}`}
      {...props}
    />
  );
}

export { Spinner };
