import { redirect } from "next/navigation";

export default function Page() {
  redirect("/admin/dashboard?tab=finance&menu=payments&item=transactions");
}
