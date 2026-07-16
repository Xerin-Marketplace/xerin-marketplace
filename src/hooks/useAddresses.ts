import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/endpoints/users";
import type { ID } from "@/types/api/common";
import type { AddressRequest } from "@/types/api/user";

export const addressesQueryKey = ["addresses"];

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: addressesQueryKey,
    queryFn: usersApi.getAddresses,
  });

  const createAddressMutation = useMutation({
    mutationFn: (payload: AddressRequest) => usersApi.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, payload }: { id: ID; payload: AddressRequest }) =>
      usersApi.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: ID) => usersApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });

  return {
    addresses: addressesQuery.data ?? [],
    isLoadingAddresses: addressesQuery.isLoading,
    isFetchingAddresses: addressesQuery.isFetching,
    addressesError: addressesQuery.error,
    refetchAddresses: addressesQuery.refetch,

    createAddress: createAddressMutation.mutateAsync,
    isCreatingAddress: createAddressMutation.isPending,
    createAddressError: createAddressMutation.error,

    updateAddress: updateAddressMutation.mutateAsync,
    isUpdatingAddress: updateAddressMutation.isPending,
    updateAddressError: updateAddressMutation.error,

    deleteAddress: deleteAddressMutation.mutateAsync,
    isDeletingAddress: deleteAddressMutation.isPending,
    deleteAddressError: deleteAddressMutation.error,
  };
};

export default useAddresses;
