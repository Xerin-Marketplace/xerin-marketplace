"use client";
import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, CheckIcon } from "@hugeicons/core-free-icons";

const GenderItem = ({ category }) => {
 const [selected, setSelected] = useState(false);
 return (
 <button
 className={`${
 selected && "text-primary"
 } group flex items-center justify-between ease-out duration-200 hover:text-primary `}
 onClick={() => setSelected(!selected)}
 >
 <div className="flex items-center gap-2">
 <div
 className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
 selected ? "border-primary bg-blue" : "bg-card border-border"
 }`}
 >
 <HugeiconsIcon icon={CheckIcon} size={12} />
 </div>

 <span>{category.name}</span>
 </div>

 <span
 className={`${
 selected ? "text-white bg-blue" : "bg-muted"
 } inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-primary`}
 >
 {category.products}
 </span>
 </button>
 );
};

const GenderDropdown = ({ genders }) => {
 const [toggleDropdown, setToggleDropdown] = useState(true);

 return (
 <div className="bg-card shadow-1 rounded-lg">
 <div
 onClick={() => setToggleDropdown(!toggleDropdown)}
 className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
 toggleDropdown && "shadow-filter"
 }`}
 >
 <p className="text-foreground">Seller Type</p>
 <button
 onClick={() => setToggleDropdown(!toggleDropdown)}
 aria-label="button for gender dropdown"
 className={`text-foreground ease-out duration-200 ${
 toggleDropdown && "rotate-180"
 }`}
 >
 <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
 </button>
 </div>

 {/* <!-- dropdown menu --> */}
 <div
 className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
 toggleDropdown ? "flex" : "hidden"
 }`}
 >
 {genders.map((gender, key) => (
 <GenderItem key={key} category={gender} />
 ))}
 </div>
 </div>
 );
};

export default GenderDropdown;
