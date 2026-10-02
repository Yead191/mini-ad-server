"use server";

import { AdResponse } from "@/types/ad";
import { nextFetch, FetchResponse } from "./NextFetch";

export const getAd = async (
  size: string
): Promise<FetchResponse<AdResponse | null>> => {
  return await nextFetch<AdResponse | null>(`/ad?size=${encodeURIComponent(size)}`, {
    method: "GET",
    cache: "no-store",
  });
};
