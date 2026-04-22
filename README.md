# Expense Tracker

A production-quality full-stack Expense Tracker — React + Vite + TypeScript (frontend) and Node.js + Express + MongoDB (backend). Supports creating, editing, deleting, filtering, and charting expenses, with full idempotency handling.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running on `localhost:27017`

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev           # → http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev           # → http://localhost:5173
```

---

## Architecture Decisions

### Why MongoDB?

Expense records are self-contained documents — no relational joins required. Compound index `{ category: 1, date: -1 }` makes the most common query pattern (filter by category, sort by date) an index scan rather than a full collection scan. A TTL index on the `idempotency` collection auto-expires records after 24 hours, eliminating the need for a manual cron job.

### Why store amounts in paise?

Floating-point arithmetic on decimals causes silent precision bugs:

```
0.1 + 0.2 === 0.30000000000000004  // true in JavaScript
```

Storing amounts as **integers in the smallest currency unit** (paise; ₹1 = 100 paise) means every computation is integer arithmetic — no rounding, no precision loss. This matches the approach taken by Razorpay, Stripe, and every production payment system. Display conversion (`paise / 100`) happens only in the UI via `Intl.NumberFormat`.

### Why React Query (TanStack Query)?

- **Caching + deduplication**: Multiple components can subscribe to `['expenses']` without triggering extra network calls.
- **Background refresh**: `refetchOnWindowFocus` keeps data fresh without manual polling.
- **Mutation lifecycle**: `onSuccess` callback invalidates the cache so the list updates automatically after create/edit/delete.
- **Separation of concerns**: Server state (React Query) stays separate from UI state (useState), which prevents the "everything in a global store" anti-pattern.

### Idempotency Strategy

`POST /api/expenses` accepts an `Idempotency-Key` UUID header generated per-submission on the client.

**Flow:**
1. Client generates a UUID at the moment the form is submitted — not per retry.
2. Server hashes the request body with SHA-256.
3. Server queries the `idempotency` collection:
   - **Not found** → process, store `{ key, requestHash, statusCode, response }`, return 201.
   - **Found, hash matches** → return the stored response (safe replay, identical result).
   - **Found, hash mismatch** → return 422 (same key, different body — client bug, not a retry).
4. Records auto-expire via MongoDB TTL index (24h).

A `useRef` guard on the form also blocks double-click at the UI level before the network call even fires.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Create expense (idempotent) |
| PATCH | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/health` | Health check |

### POST /api/expenses
```http
POST /api/expenses
Idempotency-Key: <uuid-v4>
Content-Type: application/json

{ "amount": 250.50, "category": "Food", "description": "Lunch", "date": "2024-01-15T00:00:00.000Z" }
```

Response amounts are in **paise**. The frontend divides by 100 for display.

---

## Project Structure

```
Root/
├── backend/src/
│   ├── config/db.ts               Mongoose connection
│   ├── models/Expense.ts          Schema + compound indexes
│   ├── models/Idempotency.ts      TTL-indexed idempotency store
│   ├── services/expense.service.ts Business logic + paise conversion
│   ├── controllers/               Thin request/response layer
│   ├── routes/expense.routes.ts   GET / POST / PATCH / DELETE
│   ├── middleware/error.middleware Centralised Zod + operational errors
│   └── utils/hash.util.ts         SHA-256 body fingerprinting
│
└── frontend/src/
    ├── lib/axios.ts                Axios instance + idempotency interceptor
    ├── hooks/
    │   ├── useModal.ts             open / close / toggle — reusable
    │   └── useDebounce.ts          Debounce search input
    ├── features/expenses/
    │   ├── types.ts                Shared TypeScript interfaces
    │   ├── services/expense.api.ts Typed API functions
    │   ├── utils/expense.utils.ts  Currency, filtering, chart data, category config
    │   ├── hooks/
    │   │   ├── useExpenses.ts      useQuery + derived data (summary, chart, recent)
    │   │   └── useCreateExpense.ts useMutation for create / update / delete
    │   └── components/
    │       ├── ExpenseForm.tsx     Create + edit form (shared modal body)
    │       ├── ExpenseTable.tsx    Animated table with inline edit/delete
    │       ├── ExpenseFilters.tsx  Search + category + sort controls
    │       └── ExpenseSummary.tsx  Three KPI stat cards
    ├── components/
    │   ├── ui/                     Button, Input, Select, Modal, Card, Badge
    │   ├── charts/ExpenseBarChart  Recharts stacked % bar chart
    │   └── layout/DashboardLayout  Sticky header + max-width wrapper
    └── pages/Dashboard.tsx         Wires everything together
```

---

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Client-side filter/search | No extra API calls when filters change; full dataset must be fetched upfront — fine for personal-scale data |
| Idempotency in MongoDB | Simpler ops than Redis; costs one extra DB write per unique POST |
| 24-hour TTL on idempotency | Safe for all reasonable UX retry windows; shorter (1h) would also work |
| Framer Motion for animations | Adds ~50 KB to bundle; provides professional micro-interactions that improve perceived quality |
| Two-click delete confirmation | Prevents accidental deletes without a separate confirmation modal |
| Vite proxy to backend | Zero CORS config in dev; production would use nginx or same-origin deployment |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| API server | Node.js 18 + Express 4 + TypeScript |
| Validation | Zod |
| Database | MongoDB via Mongoose 8 |
| Logging | Morgan |
| Frontend | React 18 + Vite 5 |
| Server state | TanStack Query v5 |
| Animations | Framer Motion v11 |
| Charts | Recharts v2 |
| Styling | Tailwind CSS v3 |
| HTTP client | Axios |
| Toasts | react-hot-toast |
