"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GridViewIcon,
  AirplaneTakeOff01Icon,
  RankingIcon,
  WarehouseIcon,
  Store01Icon,
} from "@hugeicons/core-free-icons";

const ACTIONS = [
  {
    label: "Shop by category",
    href: "/shop-with-sidebar",
    icon: GridViewIcon,
    tile: "bg-orange-100 text-orange-600",
  },
  {
    label: "Buy from abroad",
    href: "/shop-with-sidebar",
    icon: AirplaneTakeOff01Icon,
    tile: "bg-blue-100 text-blue-600",
  },
  {
    label: "Top ranking",
    href: "/shop-with-sidebar?sort=popular",
    icon: RankingIcon,
    tile: "bg-amber-100 text-amber-600",
  },
  {
    label: "Wholesale deals",
    href: "/shop-with-sidebar",
    icon: WarehouseIcon,
    tile: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Shop Tanzania",
    href: "/shop-with-sidebar",
    icon: Store01Icon,
    tile: "bg-violet-100 text-violet-600",
  },
];

const QuickActions = () => {
  return (
    <section className="bg-[var(--muted)] pb-2">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8 xl:px-10 2xl:px-6">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-2.5 rounded-2xl bg-card px-2 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition duration-200 group-hover:scale-110 sm:h-12 sm:w-12 ${action.tile}`}
              >
                <HugeiconsIcon icon={action.icon} size={22} />
              </span>
              <span className="text-center text-[11px] font-semibold leading-tight text-foreground/85 sm:text-xs">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
