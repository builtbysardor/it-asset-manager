import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Category, Location, Asset, User
from routers.auth import hash_password
from routers import assets, categories, locations, assignments, reports, qrcode, auth
from scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AssetTrack API", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router)
app.include_router(categories.router)
app.include_router(locations.router)
app.include_router(assignments.router)
app.include_router(reports.router)
app.include_router(qrcode.router)
app.include_router(auth.router)


def seed_db():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add(User(username="admin", hashed_password=hash_password("admin123"), full_name="Administrator"))
            db.commit()

        if db.query(Category).count() > 0:
            return

        cats = [
            Category(name="Laptop", icon="💻", color="#6366f1"),
            Category(name="Desktop", icon="🖥️", color="#8b5cf6"),
            Category(name="Server", icon="🗄️", color="#0ea5e9"),
            Category(name="Switch", icon="🔀", color="#10b981"),
            Category(name="Printer", icon="🖨️", color="#f59e0b"),
            Category(name="Monitor", icon="🖵", color="#ec4899"),
            Category(name="Phone", icon="📱", color="#ef4444"),
        ]
        locs = [
            Location(building="HQ", room="IT Room", floor="1"),
            Location(building="HQ", room="Server Room", floor="B1"),
            Location(building="HQ", room="Office A", floor="2"),
            Location(building="HQ", room="Office B", floor="2"),
            Location(building="Branch", room="Office", floor="1"),
        ]
        for c in cats: db.add(c)
        for l in locs: db.add(l)
        db.flush()

        sample_assets = [
            Asset(asset_tag="AST-0001", name="Dell XPS 15 — Admin Laptop", manufacturer="Dell", model="XPS 15 9530", serial_number="DL2024001", status="active", category_id=cats[0].id, location_id=locs[2].id, assigned_to="Max Müller", assigned_department="IT", purchase_date="2024-01-15", warranty_expiry="2027-01-15", purchase_price=1899.00, ip_address="192.168.1.101"),
            Asset(asset_tag="AST-0002", name="HP ProLiant DL380 — Main Server", manufacturer="HP", model="ProLiant DL380 Gen10", serial_number="HP2023SRV01", status="active", category_id=cats[2].id, location_id=locs[1].id, purchase_date="2023-06-01", warranty_expiry="2026-06-01", purchase_price=4500.00, ip_address="192.168.1.10"),
            Asset(asset_tag="AST-0003", name="Cisco Catalyst 2960 — Core Switch", manufacturer="Cisco", model="Catalyst 2960-X", serial_number="CSC2023SW01", status="active", category_id=cats[3].id, location_id=locs[1].id, purchase_date="2023-06-01", warranty_expiry="2026-06-01", purchase_price=1200.00),
            Asset(asset_tag="AST-0004", name="Lenovo ThinkPad T14 — Dev 1", manufacturer="Lenovo", model="ThinkPad T14 Gen4", serial_number="LN2024002", status="active", category_id=cats[0].id, location_id=locs[2].id, assigned_to="Anna Schmidt", assigned_department="Development", purchase_date="2024-02-01", warranty_expiry="2027-02-01", purchase_price=1350.00, ip_address="192.168.1.102"),
            Asset(asset_tag="AST-0005", name="HP LaserJet Pro — Office Printer", manufacturer="HP", model="LaserJet Pro M404dn", serial_number="HP2022PRN01", status="active", category_id=cats[4].id, location_id=locs[2].id, purchase_date="2022-03-10", warranty_expiry="2025-03-10", purchase_price=350.00),
            Asset(asset_tag="AST-0006", name="Dell OptiPlex 7090 — Reception", manufacturer="Dell", model="OptiPlex 7090", serial_number="DL2022DT01", status="active", category_id=cats[1].id, location_id=locs[2].id, assigned_to="Klaus Weber", assigned_department="Reception", purchase_date="2022-08-15", warranty_expiry="2025-08-15", purchase_price=780.00, ip_address="192.168.1.103"),
            Asset(asset_tag="AST-0007", name="MacBook Pro 14 — Design", manufacturer="Apple", model="MacBook Pro 14 M3", serial_number="AP2024MBP01", status="active", category_id=cats[0].id, location_id=locs[3].id, assigned_to="Lisa Bauer", assigned_department="Design", purchase_date="2024-03-01", warranty_expiry="2027-03-01", purchase_price=2199.00, ip_address="192.168.1.104"),
            Asset(asset_tag="AST-0008", name="HP ProLiant DL360 — Backup Server", manufacturer="HP", model="ProLiant DL360 Gen10", serial_number="HP2022SRV02", status="maintenance", category_id=cats[2].id, location_id=locs[1].id, purchase_date="2022-01-01", warranty_expiry="2025-01-01", purchase_price=3800.00, ip_address="192.168.1.11", notes="Disk replacement in progress"),
            Asset(asset_tag="AST-0009", name="Dell P2422H Monitor — Desk 5", manufacturer="Dell", model="P2422H", serial_number="DL2023MON01", status="active", category_id=cats[5].id, location_id=locs[3].id, purchase_date="2023-09-01", warranty_expiry="2026-09-01", purchase_price=280.00),
            Asset(asset_tag="AST-0010", name="Lenovo ThinkPad T14 — Old", manufacturer="Lenovo", model="ThinkPad T14 Gen1", serial_number="LN2020001", status="retired", category_id=cats[0].id, location_id=locs[0].id, purchase_date="2020-04-01", warranty_expiry="2023-04-01", purchase_price=1100.00, notes="Replaced by AST-0004"),
        ]
        for a in sample_assets:
            db.add(a)
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup():
    os.makedirs("data", exist_ok=True)
    seed_db()
    start_scheduler()


@app.get("/")
def root():
    return {"name": "AssetTrack API", "version": "1.0.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
