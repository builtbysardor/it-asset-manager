from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icon: Mapped[str] = mapped_column(String(10), default="💻")
    color: Mapped[str] = mapped_column(String(20), default="#6366f1")

    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="category")


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    building: Mapped[str] = mapped_column(String(100), nullable=False)
    room: Mapped[str] = mapped_column(String(100), nullable=False)
    floor: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="location")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_tag: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    serial_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")

    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("categories.id"), nullable=True)
    location_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("locations.id"), nullable=True)

    purchase_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    warranty_expiry: Mapped[str | None] = mapped_column(String(20), nullable=True)
    purchase_price: Mapped[float | None] = mapped_column(Float, nullable=True)

    assigned_to: Mapped[str | None] = mapped_column(String(200), nullable=True)
    assigned_department: Mapped[str | None] = mapped_column(String(100), nullable=True)

    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    mac_address: Mapped[str | None] = mapped_column(String(17), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category: Mapped["Category | None"] = relationship("Category", back_populates="assets")
    location: Mapped["Location | None"] = relationship("Location", back_populates="assets")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="asset")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    performed_by: Mapped[str] = mapped_column(String(100), default="system")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="audit_logs")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
