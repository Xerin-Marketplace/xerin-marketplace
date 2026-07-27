import type { PaymentOption } from "@/types/api/commerce";

interface PaymentMethodProps {
  options: PaymentOption[];
  selected: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

const PaymentMethod = ({ options, selected, onChange, isLoading }: PaymentMethodProps) => (
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
        </div>
      ) : (
        <p className="text-red">No payment method is currently enabled.</p>
      )}
    </div>
  </div>
);

export default PaymentMethod;
