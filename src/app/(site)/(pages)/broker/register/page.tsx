import { redirect } from "next/navigation";

export default function BrokerRegisterPage() {
  redirect("/signin?tab=broker");
}
