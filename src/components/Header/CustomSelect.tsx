"use client";

import React, { useState, useEffect, useRef } from "react";

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
        className={`flex items-center gap-2 w-full whitespace-nowrap rounded-l-[10px] border border-gray-3 !border-r-0 bg-gray-1/60 px-4 py-2.5 text-custom-sm font-medium text-dark-4 transition-colors hover:border-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color ${
          isOpen ? "border-orange" : ""
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg
          className={`ml-auto size-3.5 shrink-0 text-dark-4 transition-transform duration-200 dark:text-white/50 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2.95 5.67c.18-.21.5-.23.71-.05L8 9.34l4.34-3.72c.21-.18.53-.16.71.05.18.21.16.53-.05.71l-4.67 4a.5.5 0 0 1-.66 0l-4.67-4a.5.5 0 0 1-.05-.71Z" fill="currentColor" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-[10px] border border-gray-3 bg-white py-2 shadow-lg dark:border-darkTheme-border-color dark:bg-darkTheme-card">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`flex w-full items-center px-4 py-2 text-left text-custom-sm transition-colors ${
                selectedOption?.value === option.value
                  ? "bg-orange/10 font-medium text-orange"
                  : "text-dark-4 hover:bg-gray-1 dark:text-darkTheme-body-color dark:hover:bg-white/5"
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
