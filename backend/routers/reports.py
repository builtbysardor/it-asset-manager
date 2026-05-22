from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Asset, Category
from schemas import StatsOut, AssetOut

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    by_status = {}
    by_category = {}
    for a in assets:
        by_status[a.status] = by_status.get(a.status, 0) + 1
        cat_name = a.category.name if a.category else "Uncategorized"
        by_category[cat_name] = by_category.get(cat_name, 0) + 1

    return StatsOut(
        total=len(assets),
        active=by_status.get("active", 0),
        inactive=by_status.get("inactive", 0),
        maintenance=by_status.get("maintenance", 0),
        retired=by_status.get("retired", 0),
        missing=by_status.get("missing", 0),
        by_category=by_category,
        by_status=by_status,
    )


@router.get("/expiring-warranty", response_model=list[AssetOut])
def expiring_warranty(days: int = Query(30, ge=1), db: Session = Depends(get_db)):
    cutoff = (datetime.utcnow() + timedelta(days=days)).strftime("%Y-%m-%d")
    today = datetime.utcnow().strftime("%Y-%m-%d")
    assets = db.query(Asset).filter(
        Asset.warranty_expiry != None,
        Asset.warranty_expiry <= cutoff,
        Asset.warranty_expiry >= today,
        Asset.status != "retired",
    ).all()
    return assets


@router.get("/unassigned", response_model=list[AssetOut])
def unassigned_assets(db: Session = Depends(get_db)):
    return db.query(Asset).filter(
        Asset.assigned_to == None,
        Asset.status == "active",
    ).all()
