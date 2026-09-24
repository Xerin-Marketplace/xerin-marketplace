import PolicyPage from "@/components/Policies/PolicyPage";
import { marketplacePolicies } from "@/content/marketplacePolicies";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Terms of Use",
 description: marketplacePolicies.termsOfUse.summary,
};

export default function TermsPage() {
 return <PolicyPage policy={marketplacePolicies.termsOfUse} />;
}
