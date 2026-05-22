export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Location {
  id: number;
  building: string;
  room: string;
  floor?: string;
  description?: string;
}

export type AssetStatus = "active" | "inactive" | "maintenance" | "retired" | "missing";

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  status: AssetStatus;
  category?: Category;
  location?: Location;
  category_id?: number;
  location_id?: number;
  purchase_date?: string;
  warranty_expiry?: string;
  purchase_price?: number;
  assigned_to?: string;
  assigned_department?: string;
  ip_address?: string;
  mac_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetListResponse {
  total: number;
  page: number;
  limit: number;
  items: Asset[];
}

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  retired: number;
  missing: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
}

export interface AuditLog {
  id: number;
  asset_id: number;
  action: string;
  details?: string;
  performed_by: string;
  created_at: string;
}
