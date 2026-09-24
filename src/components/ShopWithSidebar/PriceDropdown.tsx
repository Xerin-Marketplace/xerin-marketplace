"use client";
import { useEffect, useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

const PriceDropdown = ({
 minPrice,
 maxPrice,
 onApply,
}: {
 minPrice: string;
 maxPrice: string;
 onApply: (min: string, max: string) => void;
}) => {
 const [toggleDropdown, setToggleDropdown] = useState(true);
 const [min, setMin] = useState(minPrice);
 const [max, setMax] = useState(maxPrice);

 useEffect(() => {
 setMin(minPrice);
 setMax(maxPrice);
 }, [minPrice, maxPrice]);

 return (
 <div className="bg-card shadow-1 rounded-lg">
 <div
 onClick={() => setToggleDropdown(!toggleDropdown)}
 className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
 >
 <p className="text-foreground">Price (TSh)</p>
 <button
 onClick={() => setToggleDropdown(!toggleDropdown)}
 id="price-dropdown-btn"
 aria-label="button for price dropdown"
 className={`text-foreground ease-out duration-200 ${
 toggleDropdown && 'rotate-180'
 }`}
 >
 <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
 </button>
 </div>

 <div className={`p-6 ${toggleDropdown ? 'block' : 'hidden'}`}>
 <div className="flex items-center gap-2">
 <label className="text-custom-xs text-muted-foreground flex flex-1 items-center rounded border border-border/80">
 <span className="block border-r border-border/80 px-2 py-1.5">
 TSh
 </span>
 <input
 type="number"
 min={0}
 value={min}
 onChange={(e) => setMin(e.target.value)}
 placeholder="Min"
 className="w-full px-2 py-1.5 outline-none"
 />
 </label>
 <span className="text-muted-foreground">–</span>
 <label className="text-custom-xs text-muted-foreground flex flex-1 items-center rounded border border-border/80">
 <span className="block border-r border-border/80 px-2 py-1.5">
 TSh
 </span>
 <input
 type="number"
 min={0}
 value={max}
 onChange={(e) => setMax(e.target.value)}
 placeholder="Max"
 className="w-full px-2 py-1.5 outline-none"
 />
 </label>
 </div>
 <button
 type="button"
 onClick={() => onApply(min.trim(), max.trim())}
 className="mt-4 w-full rounded-lg bg-foreground py-2 text-sm font-semibold text-background hover:bg-primary"
 >
 Apply
 </button>
 </div>
 </div>
 );
};

export default PriceDropdown;
