import Link from "next/link";

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
      "Go to your order history, select the affected order, and use the report or contact option. You can also reach our support team at support@xerin.co.tz.",
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
];

const QuestionIcon = () => (
  <svg
    className="mr-2 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

export default function HelpCenter() {
  const half = Math.ceil(FAQS.length / 2);
  const leftColumn = FAQS.slice(0, half);
  const rightColumn = FAQS.slice(half);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <section className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Frequently asked questions
        </h2>
        <div className="grid pt-8 text-left border-t border-gray-200 md:gap-16 dark:border-gray-700 md:grid-cols-2">
          <div>
            {leftColumn.map((faq) => (
              <div key={faq.question} className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  <QuestionIcon />
                  {faq.question}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div>
            {rightColumn.map((faq) => (
              <div key={faq.question} className="mb-10">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  <QuestionIcon />
                  {faq.question}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">Contact Support</Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} XerinMarket</span>
        </div>
      </section>
    </main>
  );
}
