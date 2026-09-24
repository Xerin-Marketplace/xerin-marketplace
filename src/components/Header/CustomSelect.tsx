"use client";

import React, { useState, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

type SelectOption = {
 label: string;
 value: string;
};

type CustomSelectProps = {
 options: SelectOption[];
 onChange?: (option: SelectOption) => void;
};

const CustomSelect = ({
 options,
 onChange = () => undefined,
}: CustomSelectProps) => {
 const [isOpen, setIsOpen] = useState(false);
 const [selectedOption, setSelectedOption] = useState(options[0]);
 const containerRef = useRef<HTMLDivElement>(null);

 const toggleDropdown = () => {
 setIsOpen(!isOpen);
 };

 const handleOptionClick = (option: SelectOption) => {
 setSelectedOption(option);
 onChange(option);
 setIsOpen(false);
 };

 useEffect(() => {
 if (!options.some((option) => option.value === selectedOption?.value)) {
 setSelectedOption(options[0]);
 onChange(options[0]);
 }
 }, [options, selectedOption?.value, onChange]);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 }

 if (isOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }

 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 };
 }, [isOpen]);

 return (
 <div ref={containerRef} className="relative" style={{ width: "170px" }}>
 <button
 type="button"
 onClick={toggleDropdown}
 className={`flex items-center gap-2 w-full whitespace-nowrap rounded-l-[10px] border border-border !border-r-0 bg-muted/60 px-4 py-2.5 text-custom-sm font-medium text-muted-foreground transition-colors hover:border-primary ${
 isOpen ? "border-primary" : ""
 }`}
 >
 <span className="truncate">{selectedOption?.label}</span>
 <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
 </button>

 {isOpen && (
 <div className="absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card py-2 shadow-lg">
 {options.map((option, index) => (
 <button
 key={index}
 type="button"
 onClick={() => handleOptionClick(option)}
 className={`flex w-full items-center px-4 py-2 text-left text-custom-sm transition-colors ${
 selectedOption?.value === option.value
 ? "bg-primary/10 font-medium text-primary"
 : "text-muted-foreground hover:bg-muted dark:hover:bg-card/5"
 }`}
 >
 <span className="truncate">{option.label}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 );
};

export default CustomSelect;
