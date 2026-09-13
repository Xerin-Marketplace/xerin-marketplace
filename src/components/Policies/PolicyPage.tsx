import Link from "next/link";
import type { MarketplacePolicy } from "@/content/marketplacePolicies";

type PolicyPageProps = {
  policy: MarketplacePolicy;
};

export default function PolicyPage({ policy }: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-gray-1 pb-12 pt-[70px] sm:pb-16 sm:pt-[85px] lg:pt-[135px] xl:pt-[145px] dark:bg-darkTheme-bg">
      <div className="mx-auto max-w-[860px] px-4 sm:px-6">
        {/* Simple Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-dark-4 dark:text-white/60">
          <Link href="/" className="hover:text-dark dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-dark-4/70 dark:text-white/40">Policies</span>
          <span>/</span>
          <span className="font-medium text-dark dark:text-white">{policy.title}</span>
        </nav>

        {/* Clean Document Card */}
        <article className="rounded-lg border border-gray-3 bg-white p-6 sm:p-10 lg:p-12 shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card">
          {/* Header */}
          <header className="border-b border-gray-3 pb-6 dark:border-darkTheme-border-color">
            <h1 className="text-2xl font-bold tracking-tight text-dark dark:text-white sm:text-3xl">
              {policy.title}
            </h1>
            <p className="mt-2 text-sm text-dark-4 dark:text-darkTheme-body-color">
              {policy.summary}
            </p>
            <p className="mt-3 text-xs text-dark-4/60 dark:text-white/40">
              Last updated: September 2026
            </p>
          </header>

          {/* Quick Table of Contents */}
          <nav className="my-6 rounded-md bg-gray-1/80 p-4 dark:bg-white/5">
            <p className="mb-2 text-xs font-semibold text-dark dark:text-white">
              Table of Contents:
            </p>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {policy.sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${index + 1}`}
                    className="text-xs text-dark-4 transition-colors hover:text-orange dark:text-darkTheme-body-color dark:hover:text-orange"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Document Content */}
          <div className="space-y-8 divide-y divide-gray-2 dark:divide-darkTheme-border-color/50">
            {policy.sections.map((section, index) => (
              <section
                key={section.heading}
                id={`section-${index + 1}`}
                className="scroll-mt-20 pt-6 first:pt-0"
              >
                <h2 className="text-base font-bold text-dark dark:text-white sm:text-lg">
                  {index + 1}. {section.heading}
                </h2>

                <div className="mt-3 space-y-3 text-sm leading-relaxed text-dark-4 dark:text-darkTheme-body-color">
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
          <footer className="mt-10 border-t border-gray-3 pt-6 dark:border-darkTheme-border-color">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold text-dark dark:text-white">
                  Have questions about these terms?
                </p>
                <p className="text-xs text-dark-4 dark:text-darkTheme-body-color">
                  Reach out to us at{" "}
                  <a
                    href="mailto:info@xerinmarketplace.com"
                    className="font-medium text-orange hover:underline"
                  >
                    info@xerinmarketplace.com
                  </a>
                </p>
              </div>
              <Link
                href="/contact"
                className="rounded-md border border-gray-3 bg-white px-4 py-2 text-xs font-semibold text-dark transition-colors hover:bg-gray-1 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white dark:hover:bg-white/10"
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
