import csv
import io
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Asset, AuditLog
from schemas import AssetCreate, AssetUpdate, AssetOut
from routers.auth import get_current_user

router = APIRouter(prefix="/api/assets", tags=["assets"])


def _next_asset_tag(db: Session) -> str:
    last = db.query(Asset).order_by(Asset.id.desc()).first()
    if last and last.asset_tag:
        try:
            num = int(last.asset_tag.split("-")[1]) + 1
        except (IndexError, ValueError):
            num = db.query(Asset).count() + 1
    else:
        num = 1
    return f"AST-{num:04d}"


def _log(db: Session, asset_id: int, action: str, details: dict, by: str = "system"):
    db.add(AuditLog(asset_id=asset_id, action=action,
                    details=json.dumps(details), performed_by=by))


@router.get("/", response_model=dict)
def list_assets(
    search: str | None = None,
    status: str | None = None,
    category_id: int | None = None,
    location_id: int | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    q = db.query(Asset)
    if search:
        s = f"%{search}%"
        q = q.filter(
            Asset.name.ilike(s) | Asset.asset_tag.ilike(s) |
            Asset.serial_number.ilike(s) | Asset.assigned_to.ilike(s) |
            Asset.notes.ilike(s)
        )
    if status:
        q = q.filter(Asset.status == status)
    if category_id:
        q = q.filter(Asset.category_id == category_id)
    if location_id:
        q = q.filter(Asset.location_id == location_id)

    total = q.count()
    items = q.order_by(Asset.id.desc()).offset((page - 1) * limit).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "items": [AssetOut.model_validate(a) for a in items]}


@router.post("/", response_model=AssetOut, status_code=201)
def create_asset(data: AssetCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    asset = Asset(asset_tag=_next_asset_tag(db), **data.model_dump())
    db.add(asset)
    db.flush()
    _log(db, asset.id, "created", {"name": asset.name, "asset_tag": asset.asset_tag})
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    assets = db.query(Asset).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "asset_tag", "name", "serial_number", "manufacturer", "model",
        "status", "category", "location", "assigned_to", "assigned_department",
        "ip_address", "mac_address", "purchase_date", "warranty_expiry",
        "purchase_price", "notes", "created_at",
    ])
    for a in assets:
        writer.writerow([
            a.asset_tag, a.name, a.serial_number or "", a.manufacturer or "",
            a.model or "", a.status,
            a.category.name if a.category else "",
            f"{a.location.building}/{a.location.room}" if a.location else "",
            a.assigned_to or "", a.assigned_department or "",
            a.ip_address or "", a.mac_address or "",
            a.purchase_date or "", a.warranty_expiry or "",
            a.purchase_price or "", a.notes or "",
            a.created_at.isoformat(),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=assets_{datetime.now().strftime('%Y%m%d')}.csv"},
    )


@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    created = 0
    errors = []
    for i, row in enumerate(reader, 1):
        try:
            asset = Asset(
                asset_tag=_next_asset_tag(db),
                name=row.get("name", "").strip(),
                serial_number=row.get("serial_number") or None,
                manufacturer=row.get("manufacturer") or None,
                model=row.get("model") or None,
                status=row.get("status", "active"),
                assigned_to=row.get("assigned_to") or None,
                assigned_department=row.get("assigned_department") or None,
                ip_address=row.get("ip_address") or None,
                mac_address=row.get("mac_address") or None,
                notes=row.get("notes") or None,
            )
            if not asset.name:
                errors.append(f"Row {i}: name is required")
                continue
            db.add(asset)
            db.flush()
            _log(db, asset.id, "imported", {"row": i})
            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")
    db.commit()
    return {"created": created, "errors": errors}


@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    return asset


@router.put("/{asset_id}", response_model=AssetOut)
def update_asset(asset_id: int, data: AssetUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    changes = {}
    for k, v in data.model_dump(exclude_none=True).items():
        old = getattr(asset, k)
        if old != v:
            changes[k] = {"from": str(old), "to": str(v)}
            setattr(asset, k, v)
    asset.updated_at = datetime.utcnow()
    if changes:
        _log(db, asset.id, "updated", changes)
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=204)
def retire_asset(asset_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    prev_status = asset.status
    asset.status = "retired"
    asset.updated_at = datetime.utcnow()
    _log(db, asset.id, "retired", {"previous_status": prev_status})
    db.commit()


@router.get("/{asset_id}/history")
def asset_history(asset_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    logs = db.query(AuditLog).filter(AuditLog.asset_id == asset_id).order_by(AuditLog.created_at.desc()).all()
    return [{"id": l.id, "action": l.action, "details": l.details,
             "performed_by": l.performed_by, "created_at": l.created_at.isoformat()} for l in logs]
