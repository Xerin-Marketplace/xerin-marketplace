import { redirect } from "next/navigation";
export default async function Page({params}:{params:Promise<{orderId:string}>}){await params;redirect("/account/orders")}
