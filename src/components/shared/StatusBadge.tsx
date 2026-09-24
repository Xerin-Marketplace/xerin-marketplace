"use client";

type Props = {
 status: string;
};

export default function StatusBadge({ status }: Props) {
 return (
 <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-accent-foreground">
 {status}
 </span>
 );
}
