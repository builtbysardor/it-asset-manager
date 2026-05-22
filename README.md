<div align="center">

# AssetTrack

**IT Asset Inventory Management System**

Track, manage, and report on every piece of hardware across your organization — from laptops and servers to switches and printers.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Overview

AssetTrack is a full-stack web application designed for IT departments and system integrators to maintain a complete, searchable inventory of hardware assets. It provides real-time dashboards, lifecycle tracking, warranty alerts, and audit history — all in a clean dark-themed interface.

Built with **Germany system integration workflows** in mind: structured asset tagging, departmental assignment, location mapping, and CSV-based bulk operations.

---

## Features

### Asset Management
- Auto-generated asset tags (`AST-0001`, `AST-0002`, ...)
- Full CRUD — create, view, update, retire assets
- Rich metadata: manufacturer, model, serial number, IP/MAC address, purchase price, warranty dates
- Assign assets to employees and departments
- Five lifecycle statuses: `active` · `inactive` · `maintenance` · `retired` · `missing`
- Full audit log — every change is timestamped and recorded

### Organization
- **Categories** — Laptop, Desktop, Server, Switch, Printer, Monitor, Phone (with icons and color coding)
- **Locations** — building / floor / room hierarchy
- **Departments** — track which team is using each asset

### Reporting & Insights
- Live dashboard with asset counts by status and category
- Expiring warranty alerts (configurable look-ahead window)
- Unassigned active assets report
- Assets by category breakdown with visual progress bars

### Data Operations
- Export full inventory to CSV with one click
- Bulk import assets via CSV upload
- Paginated list with search across name, tag, serial number, and assignee
- Filter by status, category, and location

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Backend** | FastAPI 0.115, Python 3.11+ |
| **ORM** | SQLAlchemy 2.0 (mapped columns) |
| **Database** | SQLite (file-based, zero config) |
| **Validation** | Pydantic v2 |
| **Server** | Uvicorn (ASGI) |

---

## Project Structure

```
it-asset-manager/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup seed
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # ORM models: Asset, Category, Location, AuditLog
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── requirements.txt
│   └── routers/
│       ├── assets.py        # CRUD + CSV import/export + audit history
│       ├── categories.py    # Category management
│       ├── locations.py     # Location management
│       ├── assignments.py   # Assignment endpoints
│       └── reports.py       # Stats, warranty alerts, unassigned
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx   # Root layout with sidebar
    │   │   ├── page.tsx     # Dashboard
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── Sidebar.tsx
    │   │   ├── AssetModal.tsx
    │   │   └── StatusBadge.tsx
    │   ├── lib/
    │   │   └── api.ts       # Typed API client
    │   └── types/
    │       └── index.ts     # Shared TypeScript types
    ├── next.config.ts
    ├── tailwind.config.ts
    └── package.json
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/builtbysardor/it-asset-manager.git
cd it-asset-manager
```

### 2. Start the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The API will be available at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

> On first startup, the database is created automatically and seeded with 10 sample assets across realistic categories and locations.

### 3. Start the Frontend

```bash
cd frontend

npm install
npm run dev
```

The app will be available at **http://localhost:3000**

---

## API Reference

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/assets/` | List assets (paginated, filterable) |
| `POST` | `/api/assets/` | Create a new asset |
| `GET` | `/api/assets/{id}` | Get asset by ID |
| `PUT` | `/api/assets/{id}` | Update asset |
| `DELETE` | `/api/assets/{id}` | Retire asset |
| `GET` | `/api/assets/{id}/history` | Full audit log for asset |
| `GET` | `/api/assets/export/csv` | Export all assets to CSV |
| `POST` | `/api/assets/import/csv` | Bulk import assets from CSV |

**Query parameters for listing:**
```
GET /api/assets/?search=dell&status=active&category_id=1&page=1&limit=20
```

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/stats` | Overall counts by status and category |
| `GET` | `/api/reports/expiring-warranty?days=30` | Assets with warranty expiring soon |
| `GET` | `/api/reports/unassigned` | Active assets with no assignee |

### Categories & Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories/` | List all categories |
| `POST` | `/api/categories/` | Create category |
| `GET` | `/api/locations/` | List all locations |
| `POST` | `/api/locations/` | Create location |

---

## Asset Status Lifecycle

```
active  ──────────────────────────────►  retired
  │                                          ▲
  ├──► inactive ──────────────────────────► ─┤
  │                                          │
  ├──► maintenance ──► active / retired ─── ─┤
  │                                          │
  └──► missing ────────────────────────── ──┘
```

| Status | Meaning |
|--------|---------|
| `active` | In use, fully operational |
| `inactive` | Not currently in use |
| `maintenance` | Under repair or servicing |
| `retired` | End of life, no longer used |
| `missing` | Location unknown |

---

## CSV Import Format

To bulk import assets, prepare a CSV file with the following columns:

```csv
name,serial_number,manufacturer,model,status,assigned_to,assigned_department,ip_address,mac_address,notes
Dell XPS 15,SN12345,Dell,XPS 15 9530,active,Max Müller,IT,192.168.1.50,,
HP LaserJet,SN67890,HP,LaserJet Pro M404,active,,,,,Office printer
```

Required column: `name`
All other columns are optional.

---

## Sample Data

On first run, the backend seeds the database with:

- **7 categories**: Laptop, Desktop, Server, Switch, Printer, Monitor, Phone
- **5 locations**: HQ IT Room, HQ Server Room, HQ Office A/B, Branch Office
- **10 sample assets** from vendors including Dell, HP, Cisco, Lenovo, and Apple — with realistic names, departments, prices, and warranty dates

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change this to your backend URL when deploying to a server.

---

## Deployment

### Backend (Production)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

For production use, consider replacing SQLite with PostgreSQL by updating the `DATABASE_URL` in `database.py`:

```python
DATABASE_URL = "postgresql://user:password@localhost/assettrack"
```

### Frontend (Production)

```bash
npm run build
npm start
```

Or deploy to [Vercel](https://vercel.com) with zero configuration — just set the `NEXT_PUBLIC_API_URL` environment variable in the Vercel dashboard.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built for IT system integrators · FastAPI + Next.js · Dark theme · Zero cloud dependency

</div>
