import { HugeiconsIcon } from "@hugeicons/react";
import { DatabaseIcon } from "@hugeicons/core-free-icons";

export default function UnavailableFeature({
 title,
 description,
}: {
 title: string;
 description: string;
}) {
 return (
 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="h-1 bg-primary" />
 <div className="px-5 py-8 text-center sm:px-8 sm:py-10">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground dark:border-border dark:text-muted-foreground">
 <HugeiconsIcon icon={DatabaseIcon} size={24} />
 </div>
 <p className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-primary">Backend dependency</p>
 <h3 className="mt-2 text-lg font-bold tracking-[-.01em] text-foreground sm:text-xl">{title}</h3>
 <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-muted-foreground">{description}</p>
 <p className="mx-auto mt-5 max-w-xl rounded-xl border border-dashed border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground dark:border-white/15 dark:bg-card/[.03] dark:text-muted-foreground">
 This screen intentionally shows no invented records. It will activate when its permission-controlled backend endpoint is available.
 </p>
 </div>
 </section>
 );
}
