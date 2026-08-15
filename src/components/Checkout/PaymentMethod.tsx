import type { PaymentOption } from "@/types/api/commerce";

interface PaymentMethodProps {
  options: PaymentOption[];
  selected: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  provider: string;
  phoneNumber: string;
  onProviderChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
}

const PaymentMethod = ({ options, selected, onChange, isLoading, provider, phoneNumber, onProviderChange, onPhoneNumberChange }: PaymentMethodProps) => {
  const selectedOption = options.find((option) => option.id === selected);
  return (
  <div className="mt-7.5 rounded-[10px] bg-white shadow-1 dark:bg-darkTheme-card">
    <div className="border-b border-gray-3 px-4 py-5 dark:border-darkTheme-border-color sm:px-8.5">
      <h3 className="text-xl font-medium text-dark dark:text-white">Payment Method</h3>
    </div>
    <div className="p-4 sm:p-8.5">
      {isLoading ? (
        <p className="text-dark-4">Loading payment options…</p>
      ) : options.length ? (
        <div className="flex flex-col gap-3">
          {options.map((method) => (
            <label key={method.id} className="flex cursor-pointer items-center gap-4">
              <input
                type="radio"
                name="payment"
                checked={selected === method.id}
                onChange={() => onChange(method.id)}
              />
              <span className="font-medium text-dark dark:text-white">{method.label}</span>
            </label>
          ))}
          {selectedOption?.requires_phone ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-dark dark:text-white">
                Mobile network
                <select value={provider} onChange={(event) => onProviderChange(event.target.value)} className="mt-2 w-full rounded-md border border-gray-3 bg-transparent p-3">
                  <option value="">Select network</option>
                  {selectedOption.providers.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-dark dark:text-white">
                Payment phone
                <input type="tel" value={phoneNumber} onChange={(event) => onPhoneNumberChange(event.target.value)} placeholder="+255 7XX XXX XXX" className="mt-2 w-full rounded-md border border-gray-3 bg-transparent p-3" />
              </label>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-red">No payment method is currently enabled.</p>
      )}
    </div>
  </div>
);
};

export default PaymentMethod;
