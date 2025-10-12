import axios, { type AxiosResponse } from "axios";

import { ApiError, type ApiEnvelope } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/v1/";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function unwrap<T>(
  responsePromise: Promise<AxiosResponse<ApiEnvelope<T>>>,
): Promise<T> {
  try {
    const { data } = await responsePromise;
    return data.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = err.response.data?.message ?? err.response.statusText;
      throw new ApiError(msg, err.response.status);
    }
    throw err;
  }
}
