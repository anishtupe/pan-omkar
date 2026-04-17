# 🚚 Pan Omkar Logistics — Data-Driven Logistics Platform

A full-stack logistics management system with React frontend, Flask backend, SQLite database, JWT authentication, and an admin panel.

---

## 🏗 Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | React 18, React Router 6, Axios, Chart.js |
| Backend   | Flask 3, Flask-JWT-Extended, SQLAlchemy   |
| Database  | SQLite (via SQLAlchemy ORM)               |
| Auth      | JWT tokens + bcrypt password hashing      |
| Styling   | Plain CSS (dark SaaS theme)               |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+

### 1. Start the Backend

```bash
cd backend

# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
# → http://localhost:5000
```

On first run the database is automatically created and seeded with:
- 3 users (1 admin, 2 managers)
- 10 vehicles
- 15 routes
- 50 shipments

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## 🔐 Login Credentials

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@panomkar.com         | admin123    |
| Manager | manager@panomkar.com       | manager123  |
| Manager | rahul@panomkar.com         | manager123  |

---

## 📡 API Reference

### Authentication
| Method | Endpoint        | Description        | Auth |
|--------|-----------------|--------------------|------|
| POST   | /api/signup     | Register new user  | ✗    |
| POST   | /api/login      | Login              | ✗    |
| GET    | /api/profile    | Get current user   | ✓    |

### Shipments
| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| GET    | /api/shipments        | List (pagination, search, filter) |
| POST   | /api/shipments        | Create shipment               |
| PUT    | /api/shipments/:id    | Update shipment               |
| DELETE | /api/shipments/:id    | Delete shipment               |

### Vehicles
| Method | Endpoint           | Description      |
|--------|--------------------|------------------|
| GET    | /api/vehicles      | List all         |
| POST   | /api/vehicles      | Create           |
| PUT    | /api/vehicles/:id  | Update           |
| DELETE | /api/vehicles/:id  | Delete           |

### Routes
| Method | Endpoint        | Description |
|--------|-----------------|-------------|
| GET    | /api/routes     | List all    |
| POST   | /api/routes     | Create      |
| PUT    | /api/routes/:id | Update      |
| DELETE | /api/routes/:id | Delete      |

### Analytics & Reports
| Method | Endpoint             | Description             |
|--------|----------------------|-------------------------|
| GET    | /api/analytics       | Dashboard stats & charts |
| GET    | /api/reports         | Full shipment report    |
| GET    | /api/reports/export  | Download CSV            |

### Admin (admin role only)
| Method | Endpoint              | Description  |
|--------|-----------------------|--------------|
| GET    | /api/admin/users      | List users   |
| POST   | /api/admin/users      | Create user  |
| PUT    | /api/admin/users/:id  | Update user  |
| DELETE | /api/admin/users/:id  | Delete user  |

---

## 🖥 UI Pages

| Page            | Path       | Features                                              |
|-----------------|------------|-------------------------------------------------------|
| Login           | /login     | Email + password, quick-fill buttons                  |
| Dashboard       | /          | 6 stat cards, Bar/Doughnut/Line charts, top routes, auto-refresh every 5s |
| Shipments       | /shipments | Table, search, status filter, pagination, Add/Edit/Delete |
| Fleet           | /fleet     | Vehicle cards + table, Add/Edit/Delete                |
| Route Analytics | /routes    | Busiest routes, route table, Add/Edit/Delete          |
| Reports         | /reports   | Full report table, status filter, CSV export          |
| Admin Panel     | /admin     | User management (admin only)                          |

---

## ⚙ Business Logic

- **Delay Detection**: If `actual_delivery_date > expected_delivery_date`, status is auto-set to `Delayed`
- **Auto-refresh**: Dashboard polls `/api/analytics` every 5 seconds
- **Role guard**: Admin panel is hidden from manager accounts
- **JWT**: Stored in `localStorage`, sent as `Authorization: Bearer <token>` header
- **Seeding**: Only runs once — skipped if users already exist

---

## 📁 Project Structure

```
pan-omkar/
├── backend/
│   ├── app.py              Flask application factory
│   ├── extensions.py       SQLAlchemy + JWT instances
│   ├── models.py           User, Vehicle, Route, Shipment ORM models
│   ├── seed.py             Database seeder (runs once on startup)
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py         Login / signup / profile
│       ├── shipments.py    Shipment CRUD
│       ├── vehicles.py     Vehicle CRUD
│       ├── routes_api.py   Route CRUD
│       ├── analytics.py    Analytics aggregations
│       ├── reports.py      Reports + CSV export
│       └── admin.py        Admin user management
│
└── frontend/
    └── src/
        ├── App.js              Router + protected routes
        ├── App.css             Global dark SaaS theme
        ├── context/
        │   └── AuthContext.js  Auth state + login/logout
        ├── components/
        │   └── Layout.js       Sidebar + top navbar
        └── pages/
            ├── Login.js
            ├── Dashboard.js
            ├── Shipments.js
            ├── Fleet.js
            ├── RouteAnalytics.js
            ├── Reports.js
            └── AdminPanel.js
```
