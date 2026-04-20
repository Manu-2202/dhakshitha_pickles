# 🌶️ Dhakshitha Pickles — Frontend

React + Vite storefront for Dhakshitha Pickles.

## ⚡ Quick Start

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**

> ✅ Works WITHOUT the backend — products load from built-in mock data automatically.
> Once the backend is running, it switches to live MongoDB data.

## 📁 Structure

```
frontend/
├── src/
│   ├── api.js           ← API calls (with mock fallback)
│   ├── mockData.js      ← Built-in seed data (fallback)
│   ├── pages/           ← All page components
│   ├── components/      ← Navbar, Footer, PickleCard, AdminLayout
│   └── context/         ← Auth & Cart context
├── public/
├── index.html
└── vite.config.js       ← Proxies /api → localhost:5000
```

## 🔗 Connecting to Backend

The frontend proxies `/api` to `http://localhost:5000` (see `vite.config.js`).
Start the backend first, then the frontend — live data will load automatically.
