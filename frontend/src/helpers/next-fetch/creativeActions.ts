"use server";

import { Creative, CreateCreativePayload, UpdateCreativePayload } from "@/types/creative";
import { nextFetch, FetchResponse } from "./NextFetch";

export const getCreatives = async (
  campaignId?: string
): Promise<FetchResponse<Creative[]>> => {
  const url = campaignId ? `/creatives?campaign_id=${campaignId}` : "/creatives";
  return await nextFetch<Creative[]>(url, {
    method: "GET",
    tags: ["creatives"],
  });
};

export const getCreativeById = async (
  id: string
): Promise<FetchResponse<Creative>> => {
  return await nextFetch<Creative>(`/creatives/${id}`, {
    method: "GET",
    tags: [`creative-${id}`],
  });
};

export const createCreative = async (
  payload: CreateCreativePayload | FormData
): Promise<FetchResponse<Creative>> => {
  return await nextFetch<Creative>("/creatives", {
    method: "POST",
    body: payload,
  });
};

export const uploadCreativeImage = async (
  formData: FormData
): Promise<FetchResponse<{ url: string; path: string; filename: string; size: number }>> => {
  return await nextFetch<{ url: string; path: string; filename: string; size: number }>(
    "/creatives/upload",
    {
      method: "POST",
      body: formData,
    }
  );
};

export const updateCreative = async (
  id: string,
  payload: UpdateCreativePayload
): Promise<FetchResponse<Creative>> => {
  return await nextFetch<Creative>(`/creatives/${id}`, {
    method: "PATCH",
    body: payload,
  });
};

export const deleteCreative = async (
  id: string
): Promise<FetchResponse<Creative>> => {
  return await nextFetch<Creative>(`/creatives/${id}`, {
    method: "DELETE",
  });
};
