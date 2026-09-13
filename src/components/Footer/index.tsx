"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  APP_LINKS,
  PAYMENT_LINKS,
  ROUTES,
  SOCIAL_LINKS,
} from "@/constants/links";
import { useAuth } from "@/hooks/useAuth";

const marketplacePolicyLinks = [
  { label: "Product Listing Policy", href: "/policies/product-listing" },
  { label: "Intellectual Property Protection", href: "/policies/intellectual-property" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Use", href: "/policies/terms-of-use" },
  { label: "User Information Legal Enquiry Guide", href: "/policies/legal-enquiry" },
  { label: "Integrity Compliance", href: "/policies/integrity-compliance" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const { isAuthenticated, logout } = useAuth();

  return (
    <footer className="relative overflow-hidden border-t border-gray-3 bg-gray-1 dark:border-darkTheme-border-color dark:bg-darkTheme-bg">
      {/* Giant watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden leading-none"
      >
        <span className="block translate-y-[18%] text-center text-[22vw] font-bold tracking-tighter text-dark/[0.03] dark:text-white/[0.04] sm:text-[18vw] lg:text-[14vw]">
          XERIN
        </span>
      </div>

      {/* CTA strip */}
      <div className="relative border-b border-gray-3 dark:border-darkTheme-border-color">
        <div className="mx-auto flex max-w-[1170px] flex-col items-center gap-6 px-4 py-12 text-center sm:px-8 lg:flex-row lg:justify-between lg:text-left xl:px-0">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold tracking-tight text-dark text-balance dark:text-white sm:text-3xl">
              Ready to grow your business with Xerin?
            </h3>
            <p className="text-sm text-dark-4 dark:text-darkTheme-body-color">
              Start selling, join our logistics network, or explore the marketplace — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ROUTES.sellerRegister}
              className="group inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-orange px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange/25"
            >
              Become a Seller
              <svg className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/logistics/join"
              className="group inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-dark px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-dark/90 dark:bg-darkTheme-tertiary-bg dark:ring-1 dark:ring-darkTheme-border-color dark:hover:bg-darkTheme-card"
            >
              Join Logistics
              <svg className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative mx-auto max-w-[1170px] px-4 py-14 sm:px-8 xl:px-0">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
              <Image
                src="/images/logo/logo.png"
                alt="Xerin Marketplace"
                width={150}
                height={45}
                className="object-contain"
              />
            </Link>
            <p className="max-w-xs text-sm text-dark-4 dark:text-darkTheme-body-color text-pretty">
              Tanzania's trusted marketplace for buyers and sellers. Shop with confidence,
              sell with ease, and deliver with Xerin Express.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-2.5 text-sm text-dark-4 dark:text-darkTheme-body-color">
              <span className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-orange" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Dar es Salaam, Tanzania
              </span>
              <a href="mailto:support@xerinmarket.com" className="flex items-center gap-2 transition-colors hover:text-dark dark:hover:text-white">
                <svg className="size-4 shrink-0 text-orange" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                support@xerinmarket.com
              </a>
              <a href={ROUTES.contact} className="flex items-center gap-2 transition-colors hover:text-dark dark:hover:text-white">
                <svg className="size-4 shrink-0 text-orange" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 4h16v12H4V4Zm0 0 8 8 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Help & Order Support
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SOCIAL_LINKS.facebook}
                aria-label="Facebook Social Link"
                className="text-dark-4 dark:text-darkTheme-body-color ease-out duration-200 hover:text-orange"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M8.99984 0.666504C7.48706 0.666504 6.09165 1.04648 4.81361 1.80644C3.53557 2.54019 2.51836 3.5491 1.76197 4.83317C1.03166 6.11724 0.666504 7.51923 0.666504 9.03915C0.666504 10.428 0.966452 11.7252 1.56635 12.9307C2.19233 14.1099 3.04 15.0926 4.10938 15.8788C5.17876 16.6649 6.37855 17.1497 7.70876 17.3332V11.4763H5.59608V9.03915H7.70876V7.19166C7.70876 6.16965 7.98262 5.37038 8.53035 4.79386C9.10417 4.21734 9.8736 3.92908 10.8386 3.92908C11.4646 3.92908 12.0906 3.98149 12.7166 4.08632V6.16965H11.6602C11.1908 6.16965 10.8386 6.30068 10.6039 6.56273C10.3952 6.79858 10.2909 7.09994 10.2909 7.46682V9.03915H12.6383L12.2471 11.4763H10.2909V17.3332C11.6472 17.1235 12.86 16.6256 13.9294 15.8395C14.9988 15.0533 15.8334 14.0706 16.4333 12.8913C17.0332 11.6859 17.3332 10.4018 17.3332 9.03915C17.3332 7.51923 16.955 6.11724 16.1986 4.83317C15.4683 3.5491 14.4641 2.54019 13.1861 1.80644C11.908 1.04648 10.5126 0.666504 8.99984 0.666504Z" fill="" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                aria-label="Twitter Social Link"
                className="text-dark-4 dark:text-darkTheme-body-color ease-out duration-200 hover:text-orange"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M18.3332 4.91293C17.7353 5.18229 17.0875 5.36594 16.39 5.46389C17.1124 5.02312 17.6107 4.39869 17.8847 3.59061C17.2121 3.98241 16.4896 4.25177 15.7173 4.39869C15.0447 3.68856 14.1976 3.3335 13.1762 3.3335C12.2544 3.3335 11.4572 3.66407 10.7846 4.32523C10.1119 4.98639 9.77562 5.78223 9.77562 6.71274C9.77562 6.95762 9.81299 7.21473 9.88773 7.48409C8.49261 7.41063 7.17223 7.06781 5.92659 6.45563C4.70587 5.81896 3.67198 4.98639 2.82495 3.95792C2.526 4.47216 2.37652 5.03536 2.37652 5.64755C2.37652 6.23524 2.51354 6.77396 2.78758 7.26371C3.06162 7.75345 3.42286 8.14525 3.87129 8.4391C3.34812 8.4391 2.83741 8.30442 2.33915 8.03506V8.07179C2.33915 8.87987 2.60073 9.59 3.1239 10.2022C3.64707 10.8144 4.29481 11.2062 5.0671 11.3776C4.79306 11.451 4.49411 11.4878 4.17024 11.4878C3.97094 11.4878 3.75918 11.4633 3.53496 11.4143C3.75918 12.0999 4.15778 12.6632 4.73078 13.1039C5.32869 13.5202 5.98888 13.7406 6.71135 13.7651C5.49062 14.7201 4.08305 15.1976 2.48863 15.1976C2.21459 15.1976 1.94054 15.1853 1.6665 15.1609C3.26092 16.1648 5.00482 16.6668 6.89819 16.6668C8.89122 16.6668 10.66 16.1648 12.2046 15.1609C13.6247 14.2793 14.7333 13.0794 15.5305 11.5612C16.2779 10.1165 16.6516 8.635 16.6516 7.11678L16.6142 6.67601C17.2868 6.21075 17.8598 5.62306 18.3332 4.91293Z" fill="" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                aria-label="Instagram Social Link"
                className="text-dark-4 dark:text-darkTheme-body-color ease-out duration-200 hover:text-orange"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <g clipPath="url(#clip0_317_501)">
                    <path d="M19.6562 6C19.625 5 19.4375 4.28125 19.2187 3.625C19 2.96875 18.6562 2.4375 18.125 1.90625C17.5937 1.375 17.0625 1.0625 16.4375 0.8125C15.8125 0.5625 15.125 0.40625 14.0625 0.375C12.9687 0.3125 12.6562 0.3125 10 0.3125C7.34375 0.3125 7.0625 0.3125 6 0.34375C4.9375 0.375 4.28125 0.5625 3.625 0.78125C2.96875 1 2.4375 1.375 1.90625 1.90625C1.375 2.4375 1.03125 2.96875 0.8125 3.625C0.5625 4.25 0.40625 4.9375 0.375 6C0.34375 7.0625 0.3125 7.34375 0.3125 10C0.3125 12.6562 0.3125 12.9375 0.34375 14C0.375 15.0625 0.5625 15.7188 0.78125 16.375C1 17.0312 1.34375 17.5625 1.875 18.0938C2.40625 18.625 2.96875 18.9688 3.59375 19.1875C4.21875 19.4062 4.90625 19.5938 5.96875 19.625C7.03125 19.6875 7.3125 19.6875 9.96875 19.6875C12.625 19.6875 12.9062 19.6875 13.9687 19.6562C15.0312 19.625 15.6875 19.4375 16.3437 19.2188C17 19 17.5312 18.6562 18.0625 18.125C18.5937 17.5938 18.9375 17.0312 19.1562 16.4062C19.375 15.7812 19.5625 15.0938 19.5937 14.0312C19.625 13.0312 19.625 12.7188 19.625 10.0625C19.625 7.40625 19.6875 7.0625 19.6562 6ZM17.9062 13.9062C17.875 14.8438 17.6875 15.3438 17.5625 15.7188C17.375 16.1562 17.1562 16.5 16.8125 16.8125C16.4687 17.1562 16.1562 17.3438 15.7187 17.5625C15.375 17.6875 14.875 17.875 13.9062 17.9062C12.9062 17.9062 12.5937 17.9062 10.0312 17.9062C7.46875 17.9062 7.125 17.9062 6.125 17.875C5.1875 17.8438 4.6875 17.6562 4.3125 17.5312C3.875 17.3438 3.53125 17.125 3.21875 16.7812C2.875 16.4375 2.6875 16.125 2.46875 15.6875C2.34375 15.3438 2.15625 14.8438 2.125 13.875C2.125 12.9063 2.125 12.5938 2.125 10C2.125 7.40625 2.125 7.09375 2.15625 6.09375C2.1875 5.15625 2.375 4.65625 2.5 4.28125C2.6875 3.84375 2.90625 3.5 3.21875 3.1875C3.5625 2.84375 3.875 2.65625 4.3125 2.46875C4.65625 2.34375 5.15625 2.15625 6.125 2.125C7.125 2.09375 7.4375 2.09375 10.0312 2.09375C12.625 2.09375 12.9375 2.09375 13.9375 2.125C14.875 2.15625 15.375 2.34375 15.75 2.46875C16.1875 2.65625 16.5312 2.875 16.8437 3.1875C17.1875 3.53125 17.375 3.84375 17.5937 4.28125C17.7187 4.625 17.9062 5.125 17.9375 6.09375C17.9375 7.09375 17.9375 7.40625 17.9375 10C17.9375 12.5938 17.9375 12.9062 17.9062 13.9062Z" fill="" />
                    <path d="M10.0005 5.03125C7.21924 5.03125 5.03174 7.28125 5.03174 10C5.03174 12.7812 7.28174 14.9688 10.0005 14.9688C12.7192 14.9688 15.0005 12.7812 15.0005 10C15.0005 7.21875 12.7817 5.03125 10.0005 5.03125ZM10.0005 13.25C8.18799 13.25 6.75049 11.7812 6.75049 10C6.75049 8.21875 8.21924 6.75 10.0005 6.75C11.813 6.75 13.2505 8.1875 13.2505 10C13.2505 11.8125 11.813 13.25 10.0005 13.25Z" fill="" />
                    <path d="M15.2188 5.96875C15.8573 5.96875 16.375 5.45106 16.375 4.8125C16.375 4.17391 15.8573 3.65625 15.2188 3.65625C14.5802 3.65625 14.0625 4.17391 14.0625 4.8125C14.0625 5.45106 14.5802 5.96875 15.2188 5.96875Z" fill="" />
                  </g>
                  <defs>
                    <clipPath id="clip0_317_501">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                aria-label="Linkedin Social Link"
                className="text-dark-4 dark:text-darkTheme-body-color ease-out duration-200 hover:text-orange"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M16.6535 1.6665C17.1222 1.6665 17.5129 1.83577 17.8254 2.17432C18.1639 2.48682 18.3332 2.87744 18.3332 3.34619V16.6535C18.3332 17.1222 18.1639 17.5259 17.8254 17.8644C17.5129 18.1769 17.1222 18.3332 16.6535 18.3332H3.34619C2.87744 18.3332 2.4738 18.1769 2.13525 17.8644C1.82275 17.5259 1.6665 17.1222 1.6665 16.6535V3.34619C1.6665 2.87744 1.82275 2.48682 2.13525 2.17432C2.4738 1.83577 2.87744 1.6665 3.34619 1.6665H16.6535ZM15.4295 15.4295V11.0155C15.4295 10.2603 15.1561 9.62223 14.6092 9.1014C14.0884 8.55452 13.4504 8.28109 12.6952 8.28109C12.3306 8.28109 11.966 8.38525 11.6014 8.59359C11.2368 8.80192 10.9634 9.06234 10.7811 9.37484V8.43734H8.43734V15.4295H10.7811V11.2889C10.7811 10.9764 10.8853 10.716 11.0936 10.5077C11.328 10.2733 11.6014 10.1561 11.9139 10.1561C12.2524 10.1561 12.5259 10.2733 12.7342 10.5077C12.9686 10.716 13.0858 10.9764 13.0858 11.2889V15.4295H15.4295ZM5.74202 7.14827C6.13265 7.14827 6.45817 7.01807 6.71859 6.75765C7.00505 6.47119 7.14827 6.13265 7.14827 5.74202C7.14827 5.3514 7.00505 5.02588 6.71859 4.76546C6.45817 4.479 6.13265 4.33577 5.74202 4.33577C5.3514 4.33577 5.01286 4.479 4.7264 4.76546C4.46598 5.02588 4.33577 5.3514 4.33577 5.74202C4.33577 6.13265 4.46598 6.47119 4.7264 6.75765C5.01286 7.01807 5.3514 7.14827 5.74202 7.14827ZM6.87484 15.4295V8.43734H4.57015V15.4295H6.87484Z" fill="" />
                </svg>
              </a>
            </div>

            {/* App download buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                className="flex items-center gap-2.5 rounded-[10px] bg-dark px-4 py-2.5 text-white transition-all duration-200 hover:scale-105 dark:bg-darkTheme-tertiary-bg dark:ring-1 dark:ring-darkTheme-border-color"
                href={APP_LINKS.appStore}
              >
                <svg className="fill-current" width="28" height="29" viewBox="0 0 34 35" fill="none" aria-hidden="true">
                  <path d="M29.5529 12.3412C29.3618 12.4871 25.9887 14.3586 25.9887 18.5198C25.9887 23.3331 30.2809 25.0358 30.4093 25.078C30.3896 25.1818 29.7275 27.41 28.1463 29.6804C26.7364 31.6783 25.264 33.6731 23.024 33.6731C20.7841 33.6731 20.2076 32.3918 17.6217 32.3918C15.1018 32.3918 14.2058 33.7152 12.1569 33.7152C10.1079 33.7152 8.6783 31.8664 7.03456 29.5961C5.13062 26.93 3.59229 22.7882 3.59229 18.8572C3.59229 12.552 7.756 9.20804 11.8538 9.20804C14.0312 9.20804 15.8462 10.6157 17.2133 10.6157C18.5144 10.6157 20.5436 9.12373 23.0207 9.12373C23.9595 9.12373 27.3327 9.20804 29.5529 12.3412ZM21.8447 6.45441C22.8692 5.25759 23.5939 3.59697 23.5939 1.93635C23.5939 1.70607 23.5741 1.47254 23.5313 1.28442C21.8645 1.34605 19.8815 2.37745 18.6857 3.74292C17.7469 4.79379 16.8707 6.45441 16.8707 8.13773C16.8707 8.39076 16.9135 8.64369 16.9333 8.72476C17.0387 8.74426 17.21 8.76694 17.3813 8.76694C18.8768 8.76694 20.7577 7.78094 21.8447 6.45441Z" fill="" />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-white/60 dark:text-darkTheme-secondary-muted">Download on the</span>
                  <span className="text-sm font-semibold text-white dark:text-darkTheme-text">App Store</span>
                </div>
              </a>
              <a
                className="flex items-center gap-2.5 rounded-[10px] bg-dark px-4 py-2.5 text-white transition-all duration-200 hover:scale-105 dark:bg-darkTheme-tertiary-bg dark:ring-1 dark:ring-darkTheme-border-color"
                href={APP_LINKS.googlePlay}
              >
                <svg className="fill-current" width="28" height="29" viewBox="0 0 34 35" fill="none" aria-hidden="true">
                  <path d="M5.45764 1.03125L19.9718 15.5427L23.7171 11.7973C18.5993 8.69224 11.7448 4.52679 8.66206 2.65395L6.59681 1.40278C6.23175 1.18039 5.84088 1.06062 5.45764 1.03125ZM3.24214 2.76868C3.21276 2.92814 3.1875 3.08837 3.1875 3.26041V31.939C3.1875 32.0593 3.21169 32.1713 3.22848 32.2859L17.9939 17.5205L3.24214 2.76868ZM26.1785 13.2916L21.9496 17.5205L26.1047 21.6756C28.3062 20.3412 29.831 19.4147 30.0003 19.3126C30.7486 18.8552 31.1712 18.1651 31.1586 17.4112C31.1474 16.6713 30.7247 16.0098 30.0057 15.6028C29.8449 15.5104 28.3408 14.6022 26.1785 13.2916ZM19.9718 19.4983L5.50135 33.9688C5.78248 33.9198 6.06327 33.836 6.33182 33.6737C6.70387 33.4471 16.7548 27.3492 23.6433 23.1699L19.9718 19.4983Z" fill="" />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-white/60 dark:text-darkTheme-secondary-muted">Get it on</span>
                  <span className="text-sm font-semibold text-white dark:text-darkTheme-text">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Marketplace */}
            <div className="flex flex-col gap-3">
              <h4 className="group relative text-sm font-semibold text-dark dark:text-darkTheme-text">
                Marketplace
                <span className="absolute -bottom-1 left-0 h-px w-6 bg-orange/60 transition-all duration-300 group-hover:w-full" />
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href={ROUTES.shop} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Shop Products<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.cart} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Cart<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.wishlist} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Wishlist<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.contact} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Returns & Refunds<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.contact} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Help Center<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-3">
              <h4 className="group relative text-sm font-semibold text-dark dark:text-darkTheme-text">
                Account
                <span className="absolute -bottom-1 left-0 h-px w-6 bg-orange/60 transition-all duration-300 group-hover:w-full" />
              </h4>
              <ul className="flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/account" className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                        <span className="relative">My Account<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/account/orders" className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                        <span className="relative">Orders<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                      </Link>
                    </li>
                    <li>
                      <button onClick={() => void logout()} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                        <span className="relative">Logout<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href={ROUTES.signin} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                      <span className="relative">Sign In / Register<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link href={ROUTES.trackOrder} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Track Orders<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sell */}
            <div className="flex flex-col gap-3">
              <h4 className="group relative text-sm font-semibold text-dark dark:text-darkTheme-text">
                Sell on Xerin
                <span className="absolute -bottom-1 left-0 h-px w-6 bg-orange/60 transition-all duration-300 group-hover:w-full" />
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href={ROUTES.sellerRegister} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Become a Seller<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.sellerDashboard} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Seller Dashboard<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.sellerProducts} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Manage Products<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.sellerKyc} className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Seller KYC<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Logistics */}
            <div className="flex flex-col gap-3">
              <h4 className="group relative text-sm font-semibold text-dark dark:text-darkTheme-text">
                Logistics
                <span className="absolute -bottom-1 left-0 h-px w-6 bg-orange/60 transition-all duration-300 group-hover:w-full" />
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href="/logistics/join" className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Join as Driver<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href="/logistics/join?role=rider" className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Become a Rider<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href="/logistics/join?role=driver" className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Become a Driver<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="group flex items-center gap-0.5 text-sm text-dark-4 dark:text-darkTheme-body-color transition-colors duration-200 hover:text-dark dark:hover:text-white">
                    <span className="relative">Track Shipment<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange transition-all duration-300 group-hover:w-full" /></span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Policies bar */}
        <div className="relative mt-10 border-t border-gray-3 dark:border-darkTheme-border-color pt-6">
          <p className="mb-3 text-center text-sm font-medium text-dark dark:text-darkTheme-text">
            Marketplace Policies & Legal
          </p>
          <ul
            aria-label="Marketplace policies and legal guides"
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-dark-4 dark:text-darkTheme-secondary-muted"
          >
            {marketplacePolicyLinks.map((policy, index) => (
              <React.Fragment key={policy.href}>
                <li>
                  <Link
                    href={policy.href}
                    className="transition-colors hover:text-orange hover:underline"
                  >
                    {policy.label}
                  </Link>
                </li>
                {index < marketplacePolicyLinks.length - 1 && (
                  <li aria-hidden="true" className="text-dark/20 dark:text-darkTheme-border-color">-</li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="relative mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-3 dark:border-darkTheme-border-color pt-6 sm:flex-row">
          <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
            &copy; {year}. All rights reserved by Xerin Group.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-medium text-dark-4 dark:text-darkTheme-secondary-muted">We Accept:</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href={PAYMENT_LINKS.visa} aria-label="payment system with visa card">
                <Image src="/images/payment/payment-01.svg" alt="visa card" width={66} height={22} />
              </a>
              <a href={PAYMENT_LINKS.mastercard} aria-label="payment system with master card">
                <Image src="/images/payment/payment-03.svg" alt="master card" width={33} height={24} />
              </a>
            </div>
          </div>

          <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">Dar es Salaam, Tanzania</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
