import { api } from "@/services/api";

export function unwrap<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export async function getOrEmpty<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await api.get<T | { data: T }>(url);
    return unwrap(response.data);
  } catch {
    return fallback;
  }
}
