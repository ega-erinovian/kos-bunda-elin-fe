const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuthRefresh?: boolean;
}

const AUTH_EXCLUDED_ENDPOINTS = ["/auth/login", "/auth/logout", "/auth/refresh"];

const UNAUTHORIZED_EVENT = "auth:unauthorized";

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;
  readonly formErrors?: string[];
  readonly issues?: { path: string; message: string; code: string }[];

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
    formErrors?: string[],
    issues?: { path: string; message: string; code: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.formErrors = formErrors;
    this.issues = issues;
  }
}

export function onUnauthorized(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}

function dispatchUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuthRefresh = false, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const { headers: customHeaders, ...restFetchOptions } = fetchOptions as RequestOptions & {
    headers?: Record<string, string>;
  };
  const buildInit = () => ({
    headers: {
      "Content-Type": "application/json",
      ...((customHeaders as Record<string, string>) ?? {}),
    },
    credentials: "include" as const,
    ...restFetchOptions,
  });

  const res = await fetch(url, buildInit());

  if (res.status === 401 && !skipAuthRefresh && !AUTH_EXCLUDED_ENDPOINTS.includes(endpoint)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(endpoint, { ...options, skipAuthRefresh: true });
    }
    dispatchUnauthorized();
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      message: "An unexpected error occurred",
    }));

    const fieldErrors: Record<string, string[]> | undefined =
      error.errors && typeof error.errors === "object" && !Array.isArray(error.errors)
        ? (error.errors as Record<string, string[]>)
        : undefined;
    const formErrors: string[] | undefined =
      Array.isArray(error.formErrors) && error.formErrors.length > 0 ? error.formErrors : undefined;
    const issues: { path: string; message: string; code: string }[] | undefined =
      Array.isArray(error.issues) && error.issues.length > 0 ? error.issues : undefined;

    const fieldDetail = fieldErrors
      ? Object.entries(fieldErrors)
          .filter(([, msgs]) => Array.isArray(msgs) && msgs.length > 0)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join(" | ")
      : undefined;
    const issueDetail = issues
      ? issues.map((i) => (i.path ? `${i.path}: ${i.message}` : i.message)).join(" | ")
      : undefined;
    const formDetail = formErrors?.join(" | ");

    const fallbackDetail = fieldDetail || issueDetail || formDetail;

    const legacyError = typeof error.error === "string" ? error.error : undefined;

    const message =
      error.message && error.message !== "Validation error"
        ? error.message
        : fallbackDetail || legacyError || `Request failed with status ${res.status}`;

    // If BE returned generic Validation error with empty details, surface the detail
    const finalMessage =
      error.message === "Validation error" && fallbackDetail ? fallbackDetail : message;

    throw new ApiError(finalMessage, res.status, fieldErrors, formErrors, issues);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
