import { Asset, AssetListResponse, Category, Location, Stats, AuditLog } from "@/types";
import { getToken } from "./auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function getAssets(params?: {
  search?: string;
  status?: string;
  category_id?: number;
  location_id?: number;
  page?: number;
  limit?: number;
}): Promise<AssetListResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  if (params?.location_id) qs.set("location_id", String(params.location_id));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return req<AssetListResponse>(`/api/assets?${qs}`);
}

export async function getAsset(id: number): Promise<Asset> {
  return req<Asset>(`/api/assets/${id}`);
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  return req<Asset>("/api/assets", { method: "POST", body: JSON.stringify(data) });
}

export async function updateAsset(id: number, data: Partial<Asset>): Promise<Asset> {
  return req<Asset>(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function retireAsset(id: number): Promise<void> {
  await fetch(`${API}/api/assets/${id}`, { method: "DELETE" });
}

export async function getAssetHistory(id: number): Promise<AuditLog[]> {
  return req<AuditLog[]>(`/api/assets/${id}/history`);
}

export async function assignAsset(asset_id: number, assigned_to: string, assigned_department?: string): Promise<Asset> {
  return req<Asset>("/api/assignments/assign", {
    method: "POST",
    body: JSON.stringify({ asset_id, assigned_to, assigned_department }),
  });
}

export async function unassignAsset(asset_id: number): Promise<Asset> {
  return req<Asset>(`/api/assignments/unassign/${asset_id}`, { method: "POST" });
}

export async function getCategories(): Promise<Category[]> {
  return req<Category[]>("/api/categories");
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return req<Category>("/api/categories", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  return req<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCategory(id: number): Promise<void> {
  await fetch(`${API}/api/categories/${id}`, { method: "DELETE" });
}

export async function getLocations(): Promise<Location[]> {
  return req<Location[]>("/api/locations");
}

export async function createLocation(data: Partial<Location>): Promise<Location> {
  return req<Location>("/api/locations", { method: "POST", body: JSON.stringify(data) });
}

export async function updateLocation(id: number, data: Partial<Location>): Promise<Location> {
  return req<Location>(`/api/locations/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteLocation(id: number): Promise<void> {
  await fetch(`${API}/api/locations/${id}`, { method: "DELETE" });
}

export async function getStats(): Promise<Stats> {
  return req<Stats>("/api/reports/stats");
}

export async function getUnassigned(): Promise<Asset[]> {
  return req<Asset[]>("/api/reports/unassigned");
}

export function exportCsvUrl(): string {
  return `${API}/api/assets/export/csv`;
}

export const getAssetQrUrl = (id: number) =>
  `${API}/api/assets/${id}/qr`;

export async function login(username: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(`${API}/api/auth/token`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}
