"use server";

import { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from "@/types/campaign";
import { nextFetch, FetchResponse } from "./NextFetch";

export const getCampaigns = async (): Promise<FetchResponse<Campaign[]>> => {
  return await nextFetch<Campaign[]>("/campaigns", {
    method: "GET",
    tags: ["campaigns"],
  });
};

export const getCampaignById = async (
  id: string
): Promise<FetchResponse<Campaign>> => {
  return await nextFetch<Campaign>(`/campaigns/${id}`, {
    method: "GET",
    tags: [`campaign-${id}`],
  });
};

export const createCampaign = async (
  payload: CreateCampaignPayload
): Promise<FetchResponse<Campaign>> => {
  return await nextFetch<Campaign>("/campaigns", {
    method: "POST",
    body: payload,
  });
};

export const updateCampaign = async (
  id: string,
  payload: UpdateCampaignPayload
): Promise<FetchResponse<Campaign>> => {
  return await nextFetch<Campaign>(`/campaigns/${id}`, {
    method: "PATCH",
    body: payload,
  });
};

export const deleteCampaign = async (
  id: string
): Promise<FetchResponse<Campaign>> => {
  return await nextFetch<Campaign>(`/campaigns/${id}`, {
    method: "DELETE",
  });
};
