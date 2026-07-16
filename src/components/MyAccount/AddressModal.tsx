"use client";

import React, { FormEvent, useEffect, useState } from "react";
import type { Address, AddressRequest } from "@/types/api/user";

type AddressModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  initialAddress?: Address | null;
  isSubmitting?: boolean;
  onSubmit: (payload: AddressRequest) => Promise<void> | void;
};

const emptyForm: AddressRequest = {
  country: "",
  region: "",
  city: "",
  street: "",
  postal_code: "",
  is_default: false,
};

const AddressModal = ({
  isOpen,
  closeModal,
  initialAddress,
  isSubmitting = false,
  onSubmit,
}: AddressModalProps) => {
  const [form, setForm] = useState<AddressRequest>(emptyForm);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm({
      country: initialAddress?.country ?? "",
      region: initialAddress?.region ?? "",
      city: initialAddress?.city ?? "",
      street: initialAddress?.street ?? "",
      postal_code: initialAddress?.postal_code ?? "",
      is_default: Boolean(initialAddress?.is_default),
    });
  }, [initialAddress, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      if (target && !target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleChange = (field: keyof AddressRequest, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      country: form.country.trim(),
      region: form.region.trim(),
      city: form.city.trim(),
      street: form.street.trim(),
      postal_code: form.postal_code?.trim() || null,
      is_default: Boolean(form.is_default),
    });
  };

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5 ${
        isOpen ? "block z-99999" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[760px] rounded-xl shadow-3 bg-white dark:bg-darkTheme-card p-7.5 relative modal-content">
          <button
            onClick={closeModal}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
            type="button"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div>
            <div className="mb-7">
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                {initialAddress ? "Edit Address" : "Add Address"}
              </h3>
              <p className="mt-2 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                Add delivery details exactly as required by the backend address schema.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="country" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Country <span className="text-red">*</span>
                  </label>

                  <input
                    id="country"
                    type="text"
                    value={form.country}
                    onChange={(event) => handleChange("country", event.target.value)}
                    placeholder="Tanzania"
                    required
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-70"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Region <span className="text-red">*</span>
                  </label>

                  <input
                    id="region"
                    type="text"
                    value={form.region}
                    onChange={(event) => handleChange("region", event.target.value)}
                    placeholder="Dar es Salaam"
                    required
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="city" className="block mb-2.5 dark:text-darkTheme-body-color">
                    City <span className="text-red">*</span>
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(event) => handleChange("city", event.target.value)}
                    placeholder="Ilala"
                    required
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-70"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    type="text"
                    value={form.postal_code ?? ""}
                    onChange={(event) => handleChange("postal_code", event.target.value)}
                    placeholder="Optional"
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="street" className="block mb-2.5 dark:text-darkTheme-body-color">
                  Street / Delivery Area <span className="text-red">*</span>
                </label>

                <input
                  id="street"
                  type="text"
                  value={form.street}
                  onChange={(event) => handleChange("street", event.target.value)}
                  placeholder="Street, house number, landmark"
                  required
                  disabled={isSubmitting}
                  className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-70"
                />
              </div>

              <label className="mb-6 flex items-center gap-3 text-custom-sm text-dark dark:text-white">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_default)}
                  onChange={(event) => handleChange("is_default", event.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4"
                />
                Set as default address
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="inline-flex justify-center font-medium text-dark dark:text-white bg-gray-1 dark:bg-darkTheme-secondary-bg py-3 px-7 rounded-md ease-out duration-200 hover:text-blue disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
