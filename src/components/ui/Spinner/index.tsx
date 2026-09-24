"use client";

import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

type SpinnerProps = Omit<HugeiconsIconProps, "icon" | "altIcon">;

function Spinner({ className, ...props }: SpinnerProps) {
 return (
 <HugeiconsIcon
 icon={Loading03Icon}
 role="status"
 aria-label="Loading"
 className={`size-4 animate-spin ${className || ""}`}
 {...props}
 />
 );
}

export { Spinner };
