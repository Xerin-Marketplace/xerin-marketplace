import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  listAllSellers,
  listPendingSellers,
  approveSeller,
  rejectSeller,
  listAllProducts,
  createProduct,
  listPendingProducts,
  getProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  listBusinessCategories,
  listProductCategories,
  createBusinessCategory,
  deleteBusinessCategory,
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  listProductReviews,
  updateProductReview,
  deleteProductReview,
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  refundOrder,
} from "@/lib/api/endpoints/admin";
import type {
  ListUsersParams,
  ListAllProductsParams,
  CreateProductPayload,
  UpdateProductPayload,
  CreateBusinessCategoryPayload,
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
  UpdateProductReviewPayload,
  CreateBrandPayload,
  UpdateBrandPayload,
  ListOrdersParams,
  UpdateOrderStatusPayload,
  UpdateOrderTrackingPayload,
  CancelOrderPayload,
  RefundOrderPayload,
} from "@/lib/api/endpoints/admin";

export const useAdminUsers = (params?: ListUsersParams) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => listUsers(params),
  });
};

export const useAdminAllSellers = () => {
  return useQuery({
    queryKey: ["admin-sellers"],
    queryFn: listAllSellers,
  });
};

export const useAdminPendingSellers = () => {
  return useQuery({
    queryKey: ["admin-pending-sellers"],
    queryFn: listPendingSellers,
  });
};

export const useApproveSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-sellers"] });
    },
  });
};

export const useRejectSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sellerId, reason }: { sellerId: string; reason: string }) =>
      rejectSeller(sellerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-sellers"] });
    },
  });
};

export const useAdminAllProducts = (params?: ListAllProductsParams) => {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => listAllProducts(params),
  });
};

export const useAdminCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useAdminPendingProducts = () => {
  return useQuery({
    queryKey: ["admin-pending-products"],
    queryFn: listPendingProducts,
  });
};

export const useAdminProduct = (productId: string) => {
  return useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });
};

export const useAdminDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-products"] });
    },
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-products"] });
    },
  });
};

export const useRejectProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
      rejectProduct(productId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-products"] });
    },
  });
};

export const useBusinessCategoriesList = () => {
  return useQuery({
    queryKey: ["business-categories"],
    queryFn: listBusinessCategories,
  });
};

export const useProductCategoriesList = () => {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: listProductCategories,
  });
};

export const useCreateBusinessCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBusinessCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-categories"] });
    },
  });
};

export const useDeleteBusinessCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBusinessCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-categories"] });
    },
  });
};

export const useAdminBrandsList = () => {
  return useQuery({
    queryKey: ["admin-brands"],
    queryFn: listBrands,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brandId, payload }: { brandId: string; payload: UpdateBrandPayload }) =>
      updateBrand(brandId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: string; payload: UpdateProductCategoryPayload }) =>
      updateProductCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
  });
};

export const useProductReviewsList = (params?: { status?: string }) => {
  return useQuery({
    queryKey: ["product-reviews", params],
    queryFn: () => listProductReviews(params),
  });
};

export const useUpdateProductReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateProductReviewPayload }) =>
      updateProductReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });
};

export const useDeleteProductReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });
};

export const useAdminOrdersList = (params?: ListOrdersParams) => {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => listOrders(params),
  });
};

export const useAdminOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderStatusPayload }) =>
      updateOrderStatus(orderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};

export const useUpdateOrderTracking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderTrackingPayload }) =>
      updateOrderTracking(orderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: CancelOrderPayload }) =>
      cancelOrder(orderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};

export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: RefundOrderPayload }) =>
      refundOrder(orderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};
