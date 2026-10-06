import Link from "next/link";
import type { MarketplacePolicy } from "@/content/marketplacePolicies";

type PolicyPageProps = {
 policy: MarketplacePolicy;
};

export default function PolicyPage({ policy }: PolicyPageProps) {
 return (
 <main className="min-h-screen bg-muted pb-12 pt-[70px] sm:pb-16 sm:pt-[85px] lg:pt-[135px] xl:pt-[145px]">
 <div className="mx-auto max-w-[860px] px-4 sm:px-6">
 {/* Simple Breadcrumb */}
 <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground /60">
 <Link href="/" className="hover:text-foreground dark:hover:text-white transition-colors">
 Home
 </Link>
 <span>/</span>
 <span className="text-muted-foreground/70 /40">Policies</span>
 <span>/</span>
 <span className="font-medium text-foreground">{policy.title}</span>
 </nav>

 {/* Clean Document Card */}
 <article className="rounded-lg border border-border bg-card p-6 sm:p-10 lg:p-12 shadow-sm">
 {/* Header */}
 <header className="border-b border-border pb-6">
 <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
 {policy.title}
 </h1>
 <p className="mt-2 text-sm text-muted-foreground">
 {policy.summary}
 </p>
 <p className="mt-3 text-xs text-muted-foreground/60 /40">
 Last updated: September 2026
 </p>
 </header>

 {/* Quick Table of Contents */}
 <nav className="my-6 rounded-md bg-muted/80 p-4 dark:bg-muted">
 <p className="mb-2 text-xs font-semibold text-foreground">
 Table of Contents:
 </p>
 <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
 {policy.sections.map((section, index) => (
 <li key={section.heading}>
 <a
 href={`#section-${index + 1}`}
 className="text-xs text-muted-foreground transition-colors hover:text-primary dark:hover:text-primary"
 >
 {index + 1}. {section.heading}
 </a>
 </li>
 ))}
 </ul>
 </nav>

 {/* Document Content */}
 <div className="space-y-8 divide-y divide-border">
 {policy.sections.map((section, index) => (
 <section
 key={section.heading}
 id={`section-${index + 1}`}
 className="scroll-mt-20 pt-6 first:pt-0"
 >
 <h2 className="text-base font-bold text-foreground sm:text-lg">
 {index + 1}. {section.heading}
 </h2>

 <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
 {section.paragraphs?.map((paragraph, pIdx) => (
 <p key={pIdx}>{paragraph}</p>
 ))}

 {section.bullets && (
 <ul className="list-disc pl-5 space-y-1.5 pt-1">
 {section.bullets.map((bullet, bIdx) => (
 <li key={bIdx} className="leading-relaxed">
 {bullet}
 </li>
 ))}
 </ul>
 )}
 </div>
 </section>
 ))}
 </div>

 {/* Simple Contact Footer */}
 <footer className="mt-10 border-t border-border pt-6">
 <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
 <div>
 <p className="text-xs font-semibold text-foreground">
 Have questions about these terms?
 </p>
 <p className="text-xs text-muted-foreground">
 Reach out to us at{" "}
 <a
 href="mailto:support@xerinmart.com"
 className="font-medium text-primary hover:underline"
 >
 support@xerinmart.com
 </a>
 </p>
 </div>
 <Link
 href="/contact"
 className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted dark:hover:bg-card/10"
 >
 Contact Support
 </Link>
 </div>
 </footer>
 </article>
 </div>
 </main>
 );
}
