import React from "react";
import Link from "next/link";

const FEATURES = [
  {
    title: "Secure Payments",
    description: "Mobile money, bank transfers, and card payments — all protected with encrypted checkout.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Fast Delivery",
    description: "Xerin Logistics delivers across Tanzania with real-time order tracking from purchase to doorstep.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Verified Sellers",
    description: "Every seller is vetted and approved. Buy with confidence from trusted marketplace partners.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Easy Returns",
    description: "Changed your mind? Return eligible products within 7 days for a full refund — no questions asked.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v6h6" />
        <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
      </svg>
    ),
    color: "from-purple-500 to-pink-500",
  },
];

const STATS = [
  { value: "10K+", label: "Products listed" },
  { value: "500+", label: "Verified sellers" },
  { value: "50K+", label: "Happy buyers" },
  { value: "24/7", label: "Customer support" },
];

const WhyChooseXerin = () => {
  return (
    <section className="overflow-hidden bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-12 lg:py-20 lg:px-6">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Why XerinMarket
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
            A marketplace built on trust
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            We connect buyers and sellers with secure payments, fast delivery, and reliable customer service — all in one platform.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 dark:from-gray-800 dark:to-gray-700 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/shop-with-sidebar"
            className="inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-dark"
          >
            Start shopping
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-orange hover:text-orange dark:border-gray-700 dark:text-white"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseXerin;
