"use client";

export const DEFAULT_DIAL_CODE = "255";

export const PHONE_COUNTRIES = [
 { name: "Tanzania", code: "255", flag: "🇹🇿" },
 { name: "Kenya", code: "254", flag: "🇰🇪" },
 { name: "Uganda", code: "256", flag: "🇺🇬" },
 { name: "Rwanda", code: "250", flag: "🇷🇼" },
 { name: "Burundi", code: "257", flag: "🇧🇮" },
 { name: "DR Congo", code: "243", flag: "🇨🇩" },
 { name: "Zambia", code: "260", flag: "🇿🇲" },
 { name: "Malawi", code: "265", flag: "🇲🇼" },
 { name: "Mozambique", code: "258", flag: "🇲🇿" },
 { name: "South Africa", code: "27", flag: "🇿🇦" },
 { name: "Zimbabwe", code: "263", flag: "🇿🇼" },
 { name: "Botswana", code: "267", flag: "🇧🇼" },
 { name: "Namibia", code: "264", flag: "🇳🇦" },
 { name: "Ghana", code: "233", flag: "🇬🇭" },
 { name: "Nigeria", code: "234", flag: "🇳🇬" },
 { name: "Ethiopia", code: "251", flag: "🇪🇹" },
 { name: "Somalia", code: "252", flag: "🇸🇴" },
 { name: "Egypt", code: "20", flag: "🇪🇬" },
 { name: "Morocco", code: "212", flag: "🇲🇦" },
 { name: "Algeria", code: "213", flag: "🇩🇿" },
 { name: "Tunisia", code: "216", flag: "🇹🇳" },
 { name: "Saudi Arabia", code: "966", flag: "🇸🇦" },
 { name: "United Arab Emirates", code: "971", flag: "🇦🇪" },
 { name: "Qatar", code: "974", flag: "🇶🇦" },
 { name: "Kuwait", code: "965", flag: "🇰🇼" },
 { name: "Oman", code: "968", flag: "🇴🇲" },
 { name: "Bahrain", code: "973", flag: "🇧🇭" },
 { name: "India", code: "91", flag: "🇮🇳" },
 { name: "Pakistan", code: "92", flag: "🇵🇰" },
 { name: "Bangladesh", code: "880", flag: "🇧🇩" },
 { name: "China", code: "86", flag: "🇨🇳" },
 { name: "Japan", code: "81", flag: "🇯🇵" },
 { name: "South Korea", code: "82", flag: "🇰🇷" },
 { name: "Singapore", code: "65", flag: "🇸🇬" },
 { name: "Malaysia", code: "60", flag: "🇲🇾" },
 { name: "Indonesia", code: "62", flag: "🇮🇩" },
 { name: "Philippines", code: "63", flag: "🇵🇭" },
 { name: "Australia", code: "61", flag: "🇦🇺" },
 { name: "New Zealand", code: "64", flag: "🇳🇿" },
 { name: "United Kingdom", code: "44", flag: "🇬🇧" },
 { name: "Germany", code: "49", flag: "🇩🇪" },
 { name: "France", code: "33", flag: "🇫🇷" },
 { name: "Italy", code: "39", flag: "🇮🇹" },
 { name: "Spain", code: "34", flag: "🇪🇸" },
 { name: "Netherlands", code: "31", flag: "🇳🇱" },
 { name: "Belgium", code: "32", flag: "🇧🇪" },
 { name: "Sweden", code: "46", flag: "🇸🇪" },
 { name: "Norway", code: "47", flag: "🇳🇴" },
 { name: "Switzerland", code: "41", flag: "🇨🇭" },
 { name: "Turkey", code: "90", flag: "🇹🇷" },
 { name: "United States / Canada", code: "1", flag: "🇺🇸" },
 { name: "Mexico", code: "52", flag: "🇲🇽" },
 { name: "Brazil", code: "55", flag: "🇧🇷" },
 { name: "Argentina", code: "54", flag: "🇦🇷" },
] as const;

export const cleanDialCode = (value: string) => value.replace(/\D/g, "").slice(0, 4);
export const cleanLocalPhone = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 14);

export const isValidInternationalPhone = (localDigits: string, dialCode: string) => {
 const code = cleanDialCode(dialCode);
 const local = cleanLocalPhone(localDigits);
 const totalDigits = `${code}${local}`;
 return code.length >= 1 && local.length >= 4 && totalDigits.length >= 7 && totalDigits.length <= 15;
};

export const buildInternationalPhone = (localDigits: string, dialCode: string) =>
 `+${cleanDialCode(dialCode)}${cleanLocalPhone(localDigits)}`;

export const PhoneInput = ({
 id,
 value,
 onChange,
 dialCode,
 onDialCodeChange,
 disabled,
 invalid,
 placeholder = "Phone number",
}: {
 id: string;
 value: string;
 onChange: (digits: string) => void;
 dialCode: string;
 onDialCodeChange: (code: string) => void;
 disabled?: boolean;
 invalid?: boolean;
 placeholder?: string;
}) => {
 const isKnownCode = PHONE_COUNTRIES.some((country) => country.code === dialCode);
 const selection = isKnownCode ? dialCode : "custom";

 return (
 <div>
 <div
 className={`flex flex-col sm:flex-row rounded-lg border bg-muted overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 ${
 invalid ? "border-red" : "border-border "
 }`}
 >
 <select
 aria-label="Country calling code"
 value={selection}
 disabled={disabled}
 onChange={(event) => {
 const next = event.target.value;
 onDialCodeChange(next === "custom" ? "" : next);
 }}
 className="h-11 w-full sm:w-[108px] shrink-0 cursor-pointer bg-muted pl-3 pr-2 text-sm text-foreground border-b sm:border-b-0 sm:border-r border-border outline-none"
 >
 {PHONE_COUNTRIES.map((country) => (
 <option key={`${country.name}-${country.code}`} value={country.code}>
 {country.flag} +{country.code}
 </option>
 ))}
 <option value="custom">Other / Custom code</option>
 </select>

 {selection === "custom" && (
 <div className="flex h-11 items-center border-b sm:border-b-0 sm:border-r border-border bg-muted">
 <span className="pl-3 text-muted-foreground">+</span>
 <input
 type="text"
 inputMode="numeric"
 aria-label="Custom country calling code"
 placeholder="Code"
 value={dialCode}
 onChange={(event) => onDialCodeChange(cleanDialCode(event.target.value))}
 disabled={disabled}
 className="h-11 w-20 bg-transparent px-2 outline-none"
 />
 </div>
 )}

 <input
 type="tel"
 inputMode="tel"
 id={id}
 name={id}
 placeholder={placeholder}
 value={value}
 onChange={(event) => onChange(cleanLocalPhone(event.target.value))}
 autoComplete="tel-national"
 disabled={disabled}
 className="h-11 flex-1 min-w-0 px-3.5 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
 />
 </div>
 <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
 Select your country code and enter the local number without the leading 0.
 </p>
 </div>
 );
};
