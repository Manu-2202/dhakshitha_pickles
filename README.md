# 🌶️ Dhakshitha Pickles — Full Stack App

```
pickles-v2/
├── frontend/    ← React + Vite storefront
└── backend/     ← Express + MongoDB API
```

## 🚀 Running the App

### Option A — Frontend Only (no MongoDB needed)
```bash
cd frontend
npm install
npm run dev
```
Products load from **built-in mock data** automatically when the backend is offline.

### Option B — Full Stack (with MongoDB)
```bash
# Terminal 1 — Backend
cd backend
npm install
node seed.js    # first time only
node server.js  # starts on port 5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev     # starts on port 5173
```

## 🔑 Admin Panel

Go to: **http://localhost:5173/admin/login**
Secret Key: `dhakshitha@admin2024`
