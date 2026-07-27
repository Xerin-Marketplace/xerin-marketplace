import type { ShippingOption } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";

interface ShippingMethodProps {
  options: ShippingOption[];
  selected: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

const ShippingMethod = ({ options, selected, onChange, isLoading }: ShippingMethodProps) => (
  <div className="mt-7.5 rounded-[10px] bg-white shadow-1 dark:bg-darkTheme-card">
    <div className="border-b border-gray-3 px-4 py-5 dark:border-darkTheme-border-color sm:px-8.5">
      <h3 className="text-xl font-medium text-dark dark:text-white">Shipping Method</h3>
    </div>
    <div className="p-4 sm:p-8.5">
      {isLoading ? (
        <p className="text-dark-4">Loading available delivery options…</p>
      ) : options.length ? (
        <div className="flex flex-col gap-4">
          {options.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-start gap-3.5">
              <input
                type="radio"
                name="shipping"
                checked={selected === option.id}
                onChange={() => onChange(option.id)}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold text-dark dark:text-white">
                  {option.service_name} · {formatCurrency(Number(option.amount), option.currency)}
                </span>
                <span className="text-sm text-dark-4">
                  {option.carrier} · Estimated {option.estimated_min_days}–{option.estimated_max_days} business days
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-red">No delivery option is available for the selected address.</p>
      )}
    </div>
  </div>
);

export default ShippingMethod;
