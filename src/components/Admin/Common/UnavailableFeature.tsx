import { DatabaseZap } from "lucide-react";

export default function UnavailableFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
      <div className="h-1 bg-gradient-to-r from-[#f47524] via-[#f7941d] to-transparent" />
      <div className="px-5 py-8 text-center sm:px-8 sm:py-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <DatabaseZap size={26} />
        </div>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#f47524]">Backend dependency</p>
        <h3 className="mt-2 text-lg font-bold tracking-[-.01em] text-slate-900 dark:text-white sm:text-xl">{title}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        <p className="mx-auto mt-5 max-w-xl rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 dark:border-white/15 dark:bg-white/[.03] dark:text-slate-400">
          This screen intentionally shows no invented records. It will activate when its permission-controlled backend endpoint is available.
        </p>
      </div>
    </section>
  );
}
