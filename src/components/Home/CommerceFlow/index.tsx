import Link from "next/link";
import { ROUTES } from "@/constants/links";

const steps = [
  {
    step: "01",
    title: "Discover trusted stores",
    description:
      "Browse curated categories and products from verified sellers that fit your budget and needs.",
  },
  {
    step: "02",
    title: "Checkout with confidence",
    description:
      "Pay with secure options and review order details before you confirm the purchase.",
  },
  {
    step: "03",
    title: "Track delivery end to end",
    description:
      "Follow the order from dispatch to doorstep with Xerin Logistics updates in one place.",
  },
];

const CommerceFlow = () => {
  return (
    <section className="overflow-hidden pt-15 lg:pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden rounded-[28px] border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange via-blue to-teal" />

          <div className="px-5 sm:px-8 xl:px-12 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8 lg:mb-10">
              <div className="max-w-[650px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange/10 px-4 py-2 text-sm font-medium text-orange mb-4">
                  Marketplace flow
                </span>
                <h2 className="font-semibold text-xl sm:text-2xl lg:text-heading-5 text-dark dark:text-white mb-3">
                  A simpler path from browsing to buying.
                </h2>
                <p className="text-dark-4 dark:text-darkTheme-secondary-muted max-w-[580px]">
                  The homepage should do more than showcase products. It should guide the shopper, build trust, and make the next action obvious.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={ROUTES.shop}
                  className="inline-flex items-center justify-center rounded-md bg-dark dark:bg-darkTheme-tertiary-bg px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-opacity-90"
                >
                  Start shopping
                </Link>
                <Link
                  href={ROUTES.trackOrder}
                  className="inline-flex items-center justify-center rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg px-5 py-3 text-sm font-medium text-dark dark:text-darkTheme-body-color transition-colors duration-200 hover:bg-dark hover:text-white dark:hover:bg-darkTheme-tertiary-bg"
                >
                  Track order
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-gray-1/70 dark:bg-darkTheme-secondary-bg p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-darkTheme-card text-orange font-semibold shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-dark-4 dark:text-darkTheme-secondary-muted">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                "Verified sellers",
                "Secure payments",
                "Live delivery tracking",
                "Buyer support",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-dashed border-gray-3 dark:border-darkTheme-border-color px-4 py-3 text-sm font-medium text-dark dark:text-darkTheme-body-color"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommerceFlow;