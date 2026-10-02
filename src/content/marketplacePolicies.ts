export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type MarketplacePolicy = {
  slug: string;
  title: string;
  summary: string;
  sections: PolicySection[];
};

export const marketplacePolicies = {
  productListing: {
    slug: "product-listing",
    title: "Product Listing Policy",
    summary:
      "Standards sellers must follow when listing and offering products on Xerin Mart.",
    sections: [
      {
        heading: "Accurate product information",
        paragraphs: [
          "Sellers must provide accurate, complete and current information about their businesses and every product they offer. Product titles, descriptions, prices, availability and delivery information must not mislead buyers.",
          "Sellers are responsible for the quality, legality and pricing of their products and must comply with the laws and regulations of the United Republic of Tanzania.",
        ],
      },
      {
        heading: "Prohibited listings and content",
        paragraphs: [
          "Users must not upload or publish unlawful, fraudulent, misleading, abusive or infringing content. Listings that support impersonation, malware distribution or other prohibited activity are not allowed.",
        ],
      },
      {
        heading: "Delivery and buyer expectations",
        paragraphs: [
          "Products should be dispatched within the timelines agreed at the point of sale. Estimated delivery times may vary by location and logistical conditions, and shipping costs must be presented before checkout.",
          "Buyers should inspect goods after delivery and promptly report defects, non-delivery or products that differ materially from their descriptions.",
        ],
      },
      {
        heading: "Enforcement",
        paragraphs: [
          "Xerin may remove content that breaches this policy and may suspend or terminate accounts involved in repeated or serious violations.",
        ],
      },
    ],
  },
  intellectualProperty: {
    slug: "intellectual-property",
    title: "Intellectual Property Protection",
    summary:
      "How Xerin protects the platform from infringing products and content.",
    sections: [
      {
        heading: "Respect for intellectual property",
        paragraphs: [
          "Users and sellers must not upload, advertise or distribute content or products that infringe another person’s intellectual property rights. Every seller is responsible for ensuring that the products, images and descriptions used in a listing are lawful.",
        ],
      },
      {
        heading: "Reporting a concern",
        paragraphs: [
          "A rights holder or user who believes that platform content is unlawful or infringing should report the concern through Xerin customer support at support@xerinmarketplace.com. The report should identify the relevant listing and clearly explain the concern so it can be reviewed.",
        ],
      },
      {
        heading: "Review and action",
        paragraphs: [
          "Xerin may review reported content, remove content that violates platform rules and suspend accounts involved in prohibited activity. Reports and account actions will be handled fairly through Xerin’s designated support channels.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    summary:
      "How Xerin collects, uses, protects, retains and deletes personal information.",
    sections: [
      {
        heading: "Information we process",
        paragraphs: [
          "Xerin is committed to protecting user privacy in accordance with the Personal Data Protection Act, 2022 and other applicable laws in Tanzania.",
        ],
        bullets: [
          "Names and contact details",
          "Payment information",
          "Delivery addresses",
          "Account and transaction records",
          "Website interaction and cookie data",
        ],
      },
      {
        heading: "Why we use personal information",
        paragraphs: [
          "We process personal information to provide our services, verify accounts, process payments, fulfil transactions, improve security and meet legal obligations.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "Xerin uses cookies to understand website interactions, analyse traffic, improve functionality and provide a more relevant browsing experience. Users can manage cookie preferences through their browser settings.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Users may request access to their personal data, correction of inaccurate information or deletion of their information, subject to Xerin’s legal and regulatory obligations.",
          "Account-deletion requests may be submitted through the application or customer support. Some records may be retained where required by law or needed for dispute resolution.",
        ],
      },
      {
        heading: "Retention and security",
        paragraphs: [
          "Personal data is retained only as long as necessary for business purposes and legal or regulatory obligations. When it is no longer required, it will be securely deleted or anonymised.",
          "Xerin uses reasonable technical and organisational measures to protect personal information from unauthorised access, loss or misuse.",
        ],
      },
    ],
  },
  termsOfUse: {
    slug: "terms-of-use",
    title: "Terms of Use",
    summary:
      "The core rules that apply when buyers and sellers use Xerin Mart.",
    sections: [
      {
        heading: "Your agreement with Xerin",
        paragraphs: [
          "By creating an account or using Xerin Mart, you agree to these terms. You must provide accurate and current registration information and are responsible for protecting your password and account.",
          "Xerin operates as an online platform that facilitates transactions between buyers and sellers unless expressly stated otherwise.",
        ],
      },
      {
        heading: "Permitted use",
        paragraphs: [
          "Illegal, fraudulent, misleading, abusive or otherwise prohibited activity is not allowed. Xerin may remove content that violates platform rules and may suspend accounts involved in violations.",
        ],
      },
      {
        heading: "Purchases, delivery and refunds",
        paragraphs: [
          "Shipping costs are presented before checkout and estimated delivery times may vary by location and logistical conditions. Buyers should inspect delivered goods and promptly report problems.",
          "Refunds may be available where goods are defective, not delivered or materially different from their description. A request must be submitted within the period stated at the time of purchase. Approved refunds are returned through the original payment method.",
          "Some products may be non-refundable where the seller discloses this at the point of sale and the restriction is permitted by law.",
        ],
      },
      {
        heading: "Sellers",
        paragraphs: [
          "Sellers must provide accurate business information, comply with Tanzanian law and take responsibility for the quality, legality and pricing of their products. Commission and payment terms are set out during seller onboarding.",
        ],
      },
      {
        heading: "Governing law and changes",
        paragraphs: [
          "These terms are governed by the laws of the United Republic of Tanzania. Parties are encouraged to seek an amicable resolution before using a competent court or an agreed alternative dispute-resolution process.",
          "Xerin may update these terms to reflect legal or operational changes. Continued use of the services constitutes acceptance of revised terms.",
        ],
      },
    ],
  },
  legalEnquiry: {
    slug: "legal-enquiry",
    title: "User Information Legal Enquiry Guide",
    summary:
      "How users can submit privacy, account, complaint and legal enquiries to Xerin.",
    sections: [
      {
        heading: "Submitting an enquiry",
        paragraphs: [
          "Send legal enquiries, complaints or requests concerning your information to support@xerinmarketplace.com through Xerin’s designated customer-support channel. Xerin’s registered office is in Dar es Salaam, Tanzania.",
        ],
      },
      {
        heading: "What to include",
        bullets: [
          "Your name and the contact details associated with your Xerin account",
          "A clear description of the request or complaint",
          "Relevant order, transaction, account or listing details",
          "Any supporting information that will help Xerin review the matter",
        ],
      },
      {
        heading: "Information and account requests",
        paragraphs: [
          "Users may request access to personal data, correction of inaccurate information or deletion of an account or personal information. Requests remain subject to records Xerin must retain by law or for dispute resolution.",
        ],
      },
      {
        heading: "Review and resolution",
        paragraphs: [
          "Xerin will handle enquiries fairly through its designated support channels. Where a dispute arises, the parties are encouraged to seek an amicable resolution before referring the matter to a competent court or an agreed alternative dispute-resolution mechanism.",
        ],
      },
    ],
  },
  integrityCompliance: {
    slug: "integrity-compliance",
    title: "Integrity Compliance",
    summary:
      "Platform conduct standards that promote lawful, fair and trustworthy trade.",
    sections: [
      {
        heading: "Expected conduct",
        paragraphs: [
          "All users must act lawfully and honestly when using Xerin. Sellers must provide accurate business and product information and remain responsible for product quality, legality and pricing.",
        ],
      },
      {
        heading: "Prohibited conduct",
        bullets: [
          "Fraud or attempted fraud",
          "Impersonation or misleading representations",
          "Unlawful or infringing content",
          "Malware distribution",
          "Abusive behaviour",
          "Any other illegal or prohibited platform activity",
        ],
      },
      {
        heading: "Compliance action",
        paragraphs: [
          "Xerin may remove content that breaches platform rules and may suspend or terminate accounts involved in violations. These measures protect buyers, sellers and the integrity of the platform.",
        ],
      },
      {
        heading: "Raising a complaint",
        paragraphs: [
          "Users can report integrity concerns to support@xerinmarketplace.com. Complaints will be handled through designated support channels with the aim of reaching a fair and prompt resolution.",
        ],
      },
    ],
  },
  returnsRefunds: {
    slug: "returns-refunds",
    title: "Returns & Refunds Policy",
    summary:
      "How returns, refunds and disputes work on Xerin Mart — including buyer protection and timelines.",
    sections: [
      {
        heading: "Buyer protection",
        paragraphs: [
          "Every order placed through Xerin Mart is covered by buyer protection. Your payment is held securely and is only released to the seller after the order is delivered and confirmed. If your order does not arrive, is damaged, or is materially different from the listing, you can open a dispute from your order page.",
        ],
        bullets: [
          "Secure payment through Xerin — sellers are paid only after delivery is confirmed",
          "Every order includes tracking and a clear delivery status",
          "A dispute can be opened directly from your order",
          "Our team reviews disputes fairly and quickly",
        ],
      },
      {
        heading: "When you can return an item",
        bullets: [
          "The item was not delivered",
          "The item arrived damaged or defective",
          "The item is materially different from its description or photos",
          "You received the wrong item or wrong quantity",
        ],
        paragraphs: [
          "Returns for change of mind are not guaranteed and depend on the seller's listing terms. Custom-made, perishable and personal-care items may not be eligible for return.",
        ],
      },
      {
        heading: "How to request a return or refund",
        paragraphs: [
          "Open your order from your account, choose the affected item and select the return or refund option. Describe the issue clearly and attach photos where relevant. Our team will review the request with the seller and keep you updated on the order timeline.",
        ],
      },
      {
        heading: "Refund processing",
        paragraphs: [
          "Approved refunds are issued back to the original payment method or to your Xerin wallet where applicable. Mobile money refunds follow the provider's settlement time, and card refunds depend on the bank. If a refund cannot be completed on the original method, support will contact you to agree on an alternative.",
        ],
      },
      {
        heading: "Seller obligations",
        paragraphs: [
          "Sellers must keep listings accurate, pack items safely and ship within the stated handling time. Sellers who repeatedly fail to deliver or misdescribe products may have payouts withheld and may be suspended from the platform.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [
          "For return or refund questions contact support@xerinmarketplace.com or use the contact page.",
        ],
      },
    ],
  },
} satisfies Record<string, MarketplacePolicy>;

