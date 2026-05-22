import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Asset, AuditLog
from schemas import AssignRequest, AssetOut
from routers.auth import get_current_user

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.post("/assign", response_model=AssetOut)
def assign_asset(data: AssignRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == data.asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    old_user = asset.assigned_to
    asset.assigned_to = data.assigned_to
    asset.assigned_department = data.assigned_department
    asset.updated_at = datetime.utcnow()
    db.add(AuditLog(
        asset_id=asset.id, action="assigned",
        details=json.dumps({"from": old_user, "to": data.assigned_to,
                            "department": data.assigned_department}),
        performed_by="system",
    ))
    db.commit()
    db.refresh(asset)
    return asset


@router.post("/unassign/{asset_id}", response_model=AssetOut)
def unassign_asset(asset_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    old_user = asset.assigned_to
    asset.assigned_to = None
    asset.assigned_department = None
    asset.updated_at = datetime.utcnow()
    db.add(AuditLog(
        asset_id=asset.id, action="unassigned",
        details=json.dumps({"from": old_user}),
        performed_by="system",
    ))
    db.commit()
    db.refresh(asset)
    return asset
