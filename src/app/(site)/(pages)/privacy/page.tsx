import PolicyPage from "@/components/Policies/PolicyPage";
import { marketplacePolicies } from "@/content/marketplacePolicies";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Privacy Policy",
 description: marketplacePolicies.privacy.summary,
};

export default function PrivacyPage() {
 return <PolicyPage policy={marketplacePolicies.privacy} />;
}
