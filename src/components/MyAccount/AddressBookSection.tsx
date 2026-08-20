"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAddresses } from "@/hooks/useAddresses";
import type { Address, AddressRequest } from "@/types/api/user";
import AddressModal from "./AddressModal";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

type AddressBookSectionProps = {
  isActive: boolean;
  displayName: string;
  emailLabel: string;
  phoneLabel: string;
};

const formatAddress = (address?: Address | null) => {
  if (!address) {
    return "No address added yet.";
  }

  return [address.street, address.city, address.region, address.country]
    .filter(Boolean)
    .join(", ");
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const AddressBookSection = ({
  isActive,
  displayName,
  emailLabel,
  phoneLabel,
}: AddressBookSectionProps) => {
  const {
    addresses,
    addressesError,
    refetchAddresses,
    isLoadingAddresses,
    isFetchingAddresses,
    createAddress,
    isCreatingAddress,
    updateAddress,
    isUpdatingAddress,
    setDefaultAddress,
    isSettingDefaultAddress,
    deleteAddress,
    isDeletingAddress,
  } = useAddresses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const defaultAddress = useMemo(() => {
    return addresses.find((address) => address.is_default) ?? addresses[0] ?? null;
  }, [addresses]);

  const isSubmittingAddress = isCreatingAddress || isUpdatingAddress;

  const openCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmittingAddress) {
      return;
    }

    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmitAddress = async (payload: AddressRequest) => {
    try {
      if (editingAddress) {
        await updateAddress({
          id: editingAddress.id,
          payload,
        });
        toast.success("Address updated successfully.");
      } else {
        await createAddress(payload);
        toast.success("Address added successfully.");
      }

      setIsModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save address."));
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id);
      toast.success("Default delivery address updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to set default address."));
    }
  };

  const openDeleteDialog = (address: Address) => {
    if (address.is_default && addresses.length > 1) return toast.error("Select another default address before deleting this one.");
    setDeleteTarget(address);
  };

  const handleDeleteAddress = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress(deleteTarget.id);
      toast.success("Address deleted successfully.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete address."));
    }
  };

  return (
    <>
      <div
        className={`xl:max-w-[770px] w-full ${
          isActive ? "block" : "hidden"
        }`}
      >
        <div className="bg-white dark:bg-darkTheme-card rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div>
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                Address Book
              </h3>
              <p className="mt-2 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                Manage delivery addresses used during checkout and logistics.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex justify-center font-medium text-white bg-blue py-3 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark"
            >
              Add Address
            </button>
          </div>

          <div className="mt-7 rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-5">
            <p className="text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
              Account Contact
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-custom-sm">
              <p>
                <span className="block text-dark-4 dark:text-darkTheme-secondary-muted">
                  Name
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {displayName}
                </span>
              </p>

              <p>
                <span className="block text-dark-4 dark:text-darkTheme-secondary-muted">
                  Email
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {emailLabel}
                </span>
              </p>

              <p>
                <span className="block text-dark-4 dark:text-darkTheme-secondary-muted">
                  Phone
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {phoneLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-lg bg-gray-1 dark:bg-darkTheme-secondary-bg p-5">
            <p className="text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
              Default Delivery Address
            </p>
            <p className="mt-2 font-medium text-dark dark:text-white">
              {formatAddress(defaultAddress)}
            </p>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium text-dark dark:text-white">
                Saved Addresses
              </h4>

              {isFetchingAddresses && (
                <span className="text-custom-xs text-dark-4 dark:text-darkTheme-secondary-muted">
                  Refreshing...
                </span>
              )}
            </div>

            {isLoadingAddresses ? (
              <div className="mt-5 rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-5 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                Loading addresses...
              </div>
            ) : addressesError ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"><p>Unable to load your addresses.</p><button type="button" onClick={() => void refetchAddresses()} className="mt-3 font-semibold underline">Retry</button></div>
            ) : addresses.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-gray-3 dark:border-darkTheme-border-color p-6 text-center">
                <p className="font-medium text-dark dark:text-white">
                  No address added yet.
                </p>
                <p className="mt-2 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                  Add your first delivery address to make checkout faster.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex justify-center font-medium text-white bg-blue py-3 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Add First Address
                </button>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-dark dark:text-white">
                            {address.city}, {address.region}
                          </p>

                          {address.is_default && (
                            <span className="rounded-full bg-green-light-6 px-3 py-1 text-custom-xs font-medium text-green">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                          {formatAddress(address)}
                        </p>

                        {address.postal_code && (
                          <p className="mt-1 text-custom-xs text-dark-4 dark:text-darkTheme-secondary-muted">
                            Postal Code: {address.postal_code}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(address)}
                          className="text-custom-sm font-medium text-blue hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteDialog(address)}
                          disabled={isDeletingAddress}
                          className="text-custom-sm font-medium text-red hover:underline disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        initialAddress={editingAddress}
        isSubmitting={isSubmittingAddress}
        onSubmit={handleSubmitAddress}
      />
      {deleteTarget && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-address-title" className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-darkTheme-card sm:rounded-2xl sm:p-6">
            <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10"><AlertTriangle size={20} /></span><div><h2 id="delete-address-title" className="font-bold text-dark dark:text-white">Delete saved address?</h2><p className="mt-1 text-sm leading-6 text-dark-4 dark:text-white/60">{formatAddress(deleteTarget)} will be permanently removed from your delivery addresses.</p></div></div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={isDeletingAddress} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-gray-3 px-4 text-sm font-semibold dark:border-white/10">Keep address</button><button type="button" disabled={isDeletingAddress} onClick={() => void handleDeleteAddress()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-60">{isDeletingAddress ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}Delete address</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddressBookSection;
