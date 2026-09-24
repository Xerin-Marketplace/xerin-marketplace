"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Menu } from "@/types/Menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

type DropdownProps = {
 menuItem: Menu;
 stickyMenu: boolean;
};

const Dropdown = ({ menuItem, stickyMenu }: DropdownProps) => {
 const pathname = usePathname();

 const [isOpen, setIsOpen] = useState(false);

 return (
 <li
 className="group relative"
 onMouseEnter={() => setIsOpen(true)}
 onMouseLeave={() => setIsOpen(false)}
 >
 {/* Parent Menu */}
 <button
 type="button"
 onClick={() => setIsOpen((prev) => !prev)}
 className={`flex items-center gap-1.5 text-custom-sm font-medium text-foreground hover:text-primary transition-colors ${
 stickyMenu ? "xl:py-4" : "xl:py-6"
 }`}
 >
 {menuItem.title}

 <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
 </button>

 {/* Dropdown */}
 <div
 className={`absolute left-0 top-full z-50 min-w-[240px] rounded-lg border border-border bg-card shadow-lg transition-all duration-200 ${
 isOpen
 ? "visible opacity-100 translate-y-0"
 : "invisible opacity-0 translate-y-3"
 }`}
 >
 <ul className="py-2">
 {menuItem.submenu?.map((item) => {
 const active = pathname === item.path;

 return (
 <li key={item.id}>
 <Link
 href={item.path}
 target={item.newTab ? "_blank" : "_self"}
 className={`block px-4 py-2.5 text-sm transition-colors ${
 active
 ? "bg-muted text-primary font-medium"
 : "text-foreground hover:bg-muted dark:hover:bg-darkTheme-secondary-bg hover:text-primary"
 }`}
 onClick={() => setIsOpen(false)}
 >
 {item.title}
 </Link>
 </li>
 );
 })}
 </ul>
 </div>
 </li>
 );
};

export default Dropdown;