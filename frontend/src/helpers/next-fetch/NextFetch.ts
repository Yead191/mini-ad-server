/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

export interface Pagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface FetchResponse<T = any> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  error?: string | null;
  pagination?: Pagination;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  tags?: string[];
}

export const nextFetch = async <T = any>(
  url: string,
  {
    method = "GET",
    body,
    tags,
    token,
    headers = {},
    cache = "no-store",
  }: FetchOptions = {}
): Promise<FetchResponse<T>> => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const isFormData = body instanceof FormData;
  const hasBody = body !== undefined && method !== "GET";

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers: reqHeaders,
      ...(hasBody && {
        body: isFormData ? body : JSON.stringify(body),
      }),
      cache: method === "GET" ? cache : "no-store",
      next: {
        ...(tags && { tags }),
      },
    });

    if (res.status === 204) {
      return {
        success: true,
        statusCode: 204,
        data: null as any,
      };
    }

    const contentType = res.headers.get("content-type");
    let json: any = null;
    if (contentType && contentType.includes("application/json")) {
      json = await res.json();
    }

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        message: json?.message || "Request failed",
        error: json?.errorMessages ? JSON.stringify(json.errorMessages) : "Request failed",
      };
    }

    // Handles both raw array/object returns or sendResponse wrapped returns
    const responseData = json && "data" in json ? json.data : json;

    return {
      success: true,
      statusCode: res.status,
      message: json?.message || "Success",
      data: responseData as T,
      error: null,
      pagination: json?.pagination,
    };
  } catch (err) {
    return {
      success: false,
      message: "Network error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
