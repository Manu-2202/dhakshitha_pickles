# 🛠️ Dhakshitha Pickles — Backend

Express + MongoDB REST API.

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Edit .env — set your MONGO_URI (default: local MongoDB)

# 3. Seed the database (first time only)
node seed.js

# 4. Start the server
node server.js
# or for auto-reload:
npm run dev
```

Server runs at **http://localhost:5000**

## 📁 Structure

```
backend/
├── server.js            ← Express app entry point
├── seed.js              ← Database seeder (run once)
├── .env                 ← Environment config
├── routes/
│   ├── pickles.js       ← GET/POST/PUT/DELETE /api/pickles
│   ├── auth.js          ← POST /api/auth/admin-login
│   ├── orders.js        ← Orders CRUD
│   ├── coupons.js       ← Coupons CRUD
│   └── payment.js       ← Razorpay payment
├── models/              ← Mongoose models
├── middleware/          ← JWT auth middleware
└── uploads/             ← Uploaded pickle images
```

## 🔑 Admin Login

Default secret key (from `.env`): `dhakshitha@admin2024`

Change this in `.env` → `ADMIN_SECRET_KEY`

## 🌐 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/pickles | List all pickles |
| GET | /api/pickles/:id | Single pickle |
| POST | /api/pickles | Add pickle (admin) |
| PUT | /api/pickles/:id | Update pickle (admin) |
| DELETE | /api/pickles/:id | Delete pickle (admin) |
| POST | /api/auth/admin-login | Admin login |
| GET | /api/orders | List orders (admin) |
| POST | /api/coupons | Create coupon (admin) |
