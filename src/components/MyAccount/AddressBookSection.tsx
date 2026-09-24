"use client";


import { Spinner } from "@/components/ui/Spinner";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAddresses } from "@/hooks/useAddresses";
import type { Address, AddressRequest } from "@/types/api/user";
import AddressModal from "./AddressModal";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Loading03Icon, Delete02Icon } from "@hugeicons/core-free-icons";

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
 <div className="bg-card rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
 <div>
 <h3 className="text-xl font-semibold text-foreground">
 Address Book
 </h3>
 <p className="mt-2 text-custom-sm text-muted-foreground">
 Manage delivery addresses used during checkout and logistics.
 </p>
 </div>

 <button
 type="button"
 onClick={openCreateModal}
 className="inline-flex justify-center font-medium text-white bg-blue py-3 px-5 rounded-md ease-out duration-200 hover:bg-primary-dark"
 >
 Add Address
 </button>
 </div>

 <div className="mt-7 rounded-lg border border-border p-5">
 <p className="text-custom-sm text-muted-foreground">
 Account Contact
 </p>

 <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-custom-sm">
 <p>
 <span className="block text-muted-foreground">
 Name
 </span>
 <span className="font-medium text-foreground">
 {displayName}
 </span>
 </p>

 <p>
 <span className="block text-muted-foreground">
 Email
 </span>
 <span className="font-medium text-foreground">
 {emailLabel}
 </span>
 </p>

 <p>
 <span className="block text-muted-foreground">
 Phone
 </span>
 <span className="font-medium text-foreground">
 {phoneLabel}
 </span>
 </p>
 </div>
 </div>

 <div className="mt-7 rounded-lg bg-muted p-5">
 <p className="text-custom-sm text-muted-foreground">
 Default Delivery Address
 </p>
 <p className="mt-2 font-medium text-foreground">
 {formatAddress(defaultAddress)}
 </p>
 </div>

 <div className="mt-7">
 <div className="flex items-center justify-between gap-3">
 <h4 className="font-medium text-foreground">
 Saved Addresses
 </h4>

 {isFetchingAddresses && (
 <span className="text-custom-xs text-muted-foreground">
 Refreshing...
 </span>
 )}
 </div>

 {isLoadingAddresses ? (
 <div className="mt-5 rounded-lg border border-border p-5 text-custom-sm text-muted-foreground">
 Loading addresses...
 </div>
 ) : addressesError ? (
 <div className="mt-5 rounded-lg border border-red-light-4 bg-red-light-6 p-6 text-center text-sm text-red-dark"><p>Unable to load your addresses.</p><button type="button" onClick={() => void refetchAddresses()} className="mt-3 font-semibold underline">Retry</button></div>
 ) : addresses.length === 0 ? (
 <div className="mt-5 rounded-lg border border-dashed border-border p-6 text-center">
 <p className="font-medium text-foreground">
 No address added yet.
 </p>
 <p className="mt-2 text-custom-sm text-muted-foreground">
 Add your first delivery address to make checkout faster.
 </p>
 <button
 type="button"
 onClick={openCreateModal}
 className="mt-5 inline-flex justify-center font-medium text-white bg-blue py-3 px-5 rounded-md ease-out duration-200 hover:bg-primary-dark"
 >
 Add First Address
 </button>
 </div>
 ) : (
 <div className="mt-5 grid grid-cols-1 gap-4">
 {addresses.map((address) => (
 <div
 key={address.id}
 className="rounded-lg border border-border p-5"
 >
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <p className="font-medium text-foreground">
 {address.city}, {address.region}
 </p>

 {address.is_default && (
 <span className="rounded-full bg-green-light-6 px-3 py-1 text-custom-xs font-medium text-green">
 Default
 </span>
 )}
 </div>

 <p className="mt-2 text-custom-sm text-muted-foreground">
 {formatAddress(address)}
 </p>

 {address.postal_code && (
 <p className="mt-1 text-custom-xs text-muted-foreground">
 Postal Code: {address.postal_code}
 </p>
 )}

 {address.latitude != null && address.longitude != null && (
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <span className="rounded-full bg-green-light-6 px-3 py-1 text-custom-xs font-medium text-green">
 GPS location saved
 </span>
 <a
 href={`https://www.google.com/maps/search/?api=1&query=${Number(address.latitude)},${Number(address.longitude)}`}
 target="_blank"
 rel="noreferrer"
 className="text-custom-xs font-semibold text-primary hover:underline"
 >
 View on Google Maps
 </a>
 </div>
 )}
 </div>

 <div className="flex gap-3">
 <button
 type="button"
 onClick={() => openEditModal(address)}
 className="text-custom-sm font-medium text-primary hover:underline"
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
 <div role="dialog" aria-modal="true" aria-labelledby="delete-address-title" className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-lg sm:rounded-2xl sm:p-6">
 <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-light-6 text-destructive dark:bg-destructive/10"><HugeiconsIcon icon={Alert02Icon} size={20} /></span><div><h2 id="delete-address-title" className="font-bold text-foreground">Delete saved address?</h2><p className="mt-1 text-sm leading-6 text-muted-foreground /60">{formatAddress(deleteTarget)} will be permanently removed from your delivery addresses.</p></div></div>
 <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={isDeletingAddress} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold dark:border-border">Keep address</button><button type="button" disabled={isDeletingAddress} onClick={() => void handleDeleteAddress()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-bold text-white disabled:opacity-60">{isDeletingAddress ? <Spinner size={16} /> : <HugeiconsIcon icon={Delete02Icon} size={16} />}Delete address</button></div>
 </div>
 </div>
 )}
 </>
 );
};

export default AddressBookSection;
