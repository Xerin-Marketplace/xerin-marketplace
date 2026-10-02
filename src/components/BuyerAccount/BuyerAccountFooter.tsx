"use client";
import Link from "next/link";
export default function BuyerAccountFooter(){return <footer className="border-t border-border bg-card px-4 py-5 text-sm text-muted-foreground dark:border-border"><div className="mx-auto flex max-w-[1170px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Xerin Mart</p><div className="flex flex-wrap gap-4"><Link href="/contact">Help Center</Link><Link href="/account/orders">Orders</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>}
