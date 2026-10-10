"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

type FAQ = {
 question: string;
 answer: string;
};

const FAQS: FAQ[] = [
 {
 question: "How do I reset my password?",
 answer:
 "Go to the forgot password page, enter your registered email address, and follow the instructions sent to your email to reset your password.",
 },
 {
 question: "How long does delivery take?",
 answer:
 "Delivery times vary by location and logistics provider. Estimated delivery times are shown before checkout and tracked in your order history once the order is placed.",
 },
 {
 question: "How do I become a seller?",
 answer:
 "Sign up for a seller account, complete the onboarding process, submit the required business documents, and once approved by Xerin you can start listing products.",
 },
 {
 question: "When do I receive my seller payouts?",
 answer:
 "Seller payouts are processed according to the payout schedule set during onboarding. You can request a payout from your seller wallet to your verified bank or mobile money account.",
 },
 {
 question: "What payment methods are supported?",
 answer:
 "Xerin supports mobile money, bank transfers and card payments. Available options may vary depending on your region and the transaction type.",
 },
 {
 question: "How do I report a problem with an order?",
 answer:
 "Go to your order history, select the affected order, and use the report or contact option. You can also reach our support team at support@xerinmart.com.",
 },
 {
 question: "Can I cancel an order?",
 answer:
 "Orders can be cancelled before they are shipped. Once a shipment has been dispatched, contact support to request a cancellation or return.",
 },
 {
 question: "Is my personal data safe?",
 answer:
 "Xerin protects personal information in accordance with the Personal Data Protection Act, 2022. See our Privacy Policy for details on how we collect, use and protect your data.",
 },
 {
 question: "How do I earn as a broker?",
 answer:
 "Open Opportunities, accept a product campaign, and share your personal referral link. You earn the listed reward for every sale made through your link.",
 },
 {
 question: "When is my broker commission paid?",
 answer:
 "Commission is pending while the order is in progress and becomes available once the order is delivered. Cancelled or refunded orders reverse the commission automatically.",
 },
 {
 question: "How do broker product listings work?",
 answer:
 "Submit a product with at least one image. After admin approval it stays live for 24 hours. When it expires you can relist it instantly from your products page — no second review needed.",
 },
 {
 question: "How do I withdraw my broker earnings?",
 answer:
 "Add a payout account in your broker wallet, then request a payout. Your available balance can be withdrawn; payouts stay on hold until admin completes them.",
 },
];

const QuestionIcon = () => (
 <HugeiconsIcon
 icon={HelpCircleIcon}
 size={20}
 className="mr-2 flex-shrink-0 text-muted-foreground dark:text-muted-foreground"
 />
);

export default function HelpCenter() {
 const half = Math.ceil(FAQS.length / 2);
 const leftColumn = FAQS.slice(0, half);
 const rightColumn = FAQS.slice(half);

 return (
 <div className="min-h-screen bg-background">
 <section className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
 <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-foreground">
 Frequently asked questions
 </h2>

 <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted p-5">
 <div>
 <p className="text-sm font-bold text-foreground">New to Xerin Marketplace?</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Take a short guided tour of your dashboard · it takes less than a minute.
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 try {
 window.localStorage.removeItem("xerin_tour_done_buyer_dashboard");
 window.localStorage.removeItem("xerin_tour_done_seller_dashboard");
 } catch {
 /* storage unavailable */
 }
 window.location.href = "/account";
 }}
 className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 Show me around <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
 </button>
 </div>
 <div className="grid pt-8 text-left border-t border-border md:gap-16 dark:border-border md:grid-cols-2">
 <div>
 {leftColumn.map((faq) => (
 <div key={faq.question} className="mb-10">
 <h3 className="flex items-center mb-4 text-lg font-medium text-foreground">
 <QuestionIcon />
 {faq.question}
 </h3>
 <p className="text-muted-foreground dark:text-muted-foreground">{faq.answer}</p>
 </div>
 ))}
 </div>
 <div>
 {rightColumn.map((faq) => (
 <div key={faq.question} className="mb-10">
 <h3 className="flex items-center mb-4 text-lg font-medium text-foreground">
 <QuestionIcon />
 {faq.question}
 </h3>
 <p className="text-muted-foreground dark:text-muted-foreground">{faq.answer}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground dark:text-muted-foreground">
 <Link href="/terms" className="hover:text-foreground dark:hover:text-white">Terms</Link>
 <span>•</span>
 <Link href="/privacy" className="hover:text-foreground dark:hover:text-white">Privacy</Link>
 <span>•</span>
 <Link href="/contact" className="hover:text-foreground dark:hover:text-white">Contact Support</Link>
 <span>•</span>
 <span>© {new Date().getFullYear()} Xerin Marketplace</span>
 </div>
 </section>
 </div>
 );
}
