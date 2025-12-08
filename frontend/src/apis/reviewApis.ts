/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const reviewApis = {
  writeReview: async ({
    product_id,
    rating,
    comment,
  }: {
    product_id: number | string;
    rating: number;
    comment: string;
  }) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(
      `${BASE_URL}/reviews/product/${product_id}`,
      {
        rating,
        comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },

  getReviewByProduct: async (
    product_id: number | string,
    star: number | null
  ) => {
    const token = localStorage.getItem("accessToken");
    const url = star
      ? `${BASE_URL}/reviews/product/${product_id}?star=${star}`
      : `${BASE_URL}/reviews/product/${product_id}`;
    const res = await axios.get(
      // `${BASE_URL}/reviews/product/${product_id}${star ? `?star=${star}` : ""}`,
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
  updateReview: async ({
    review_id,
    comment,
    rating,
  }: {
    review_id: number;
    comment: string;
    rating: number;
  }) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.put(
      `${BASE_URL}/reviews/${review_id}`,
      { comment, rating },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
  deleteReview: async ({ review_id }: { review_id: number }) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.delete(`${BASE_URL}/reviews/${review_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};
