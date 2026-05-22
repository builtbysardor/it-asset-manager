from datetime import datetime
from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    icon: str = "💻"
    color: str = "#6366f1"

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    model_config = {"from_attributes": True}


class LocationBase(BaseModel):
    building: str
    room: str
    floor: str | None = None
    description: str | None = None

class LocationCreate(LocationBase):
    pass

class LocationOut(LocationBase):
    id: int
    model_config = {"from_attributes": True}


class AssetBase(BaseModel):
    name: str
    serial_number: str | None = None
    manufacturer: str | None = None
    model: str | None = None
    status: str = "active"
    category_id: int | None = None
    location_id: int | None = None
    purchase_date: str | None = None
    warranty_expiry: str | None = None
    purchase_price: float | None = None
    assigned_to: str | None = None
    assigned_department: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None
    notes: str | None = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(AssetBase):
    name: str | None = None

class AssetOut(AssetBase):
    id: int
    asset_tag: str
    category: CategoryOut | None = None
    location: LocationOut | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class AuditLogOut(BaseModel):
    id: int
    asset_id: int
    action: str
    details: str | None = None
    performed_by: str
    created_at: datetime
    model_config = {"from_attributes": True}


class AssignRequest(BaseModel):
    asset_id: int
    assigned_to: str
    assigned_department: str | None = None


class StatsOut(BaseModel):
    total: int
    active: int
    inactive: int
    maintenance: int
    retired: int
    missing: int
    by_category: dict[str, int]
    by_status: dict[str, int]
