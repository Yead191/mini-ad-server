"use server";

import { ReportResult } from "@/types/report";
import { nextFetch, FetchResponse } from "./NextFetch";

export const getReport = async (
  from: string,
  to: string,
  groupBy: "campaign" | "day" = "campaign"
): Promise<FetchResponse<ReportResult>> => {
  return await nextFetch<ReportResult>(
    `/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
      to
    )}&group_by=${encodeURIComponent(groupBy)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
};
