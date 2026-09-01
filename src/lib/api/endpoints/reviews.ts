"use client";

import axiosInstance from "../client";

export type CustomerReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  verified_purchase: boolean;
  status: string;
  seller_reply?: string | null;
  seller_replied_at?: string | null;
  helpful_count: number;
  created_at: string;
  updated_at?: string | null;
};

export type CustomerReviewList = {
  total: number;
  page: number;
  page_size: number;
  average_rating: number | string;
  results: CustomerReview[];
};

export type ReviewCreatePayload = {
  order_item_id: string;
  rating: number;
  title?: string;
  comment?: string;
};

export const reviewsApi = {
  mine: async (params: { page?: number; page_size?: number } = {}) =>
    (await axiosInstance.get<CustomerReviewList>("/reviews/my", { params })).data,

  createProduct: async (productId: string, payload: ReviewCreatePayload) =>
    (await axiosInstance.post<CustomerReview>(`/products/${productId}/reviews`, payload)).data,

  update: async (
    reviewId: string,
    payload: Partial<Pick<ReviewCreatePayload, "rating" | "title" | "comment">>,
  ) => (await axiosInstance.patch<CustomerReview>(`/reviews/${reviewId}`, payload)).data,

  remove: async (reviewId: string) => {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  },
};
