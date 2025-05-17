# Flower Order Management System

**Demo:** [https://flower-order-wolfpack.onrender.com/docs/](https://flower-order-wolfpack.onrender.com/docs/)

A Node.js + TypeScript backend for a flower ordering system, supporting both admin dashboard and iOS app clients.

---

## 🚀 Tech Stack
- **Node.js** + **TypeScript**
- **Express** (REST API)
- **TypeORM** (SQLite)
- **class-validator**, **class-transformer** (validation/sanitization)
- **Winston** (logging)
- **Swagger UI** (API docs)
- **Helmet**, **CORS**, **Morgan** (security & logging middleware)
- **Jest**, **Supertest** (testing)
- **ESLint**, **Prettier** (linting/formatting)

---

## 🌸 Capabilities
- Full order lifecycle management (PENDING → DELIVERED/CANCELLED)
- Strict state transitions (admin vs. app)
- Soft delete (with force delete option)
- Input validation & sanitization
- Centralized logging with correlation IDs
- Feature flags (e.g., filtering)
- Comprehensive test coverage
- API documentation with Swagger UI
- Seed & migration scripts

---

## 📖 API Documentation

- **Swagger UI (Deployed):** [https://flower-order-wolfpack.onrender.com/docs/](https://flower-order-wolfpack.onrender.com/docs/)
- **Swagger UI (Local):** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Swagger JSON:** [http://localhost:3000/docs.json](http://localhost:3000/docs.json)

### Authentication / Client Type
All endpoints require the `x-client-type` header:
- `x-client-type: admin` (for admin dashboard)
- `x-client-type: ios` (for iOS app)

### Example curl (admin):
```sh
curl -X GET 'http://localhost:3000/api/orders' \
  -H 'accept: application/json' \
  -H 'x-client-type: admin'
```

### Example curl (iOS):
```sh
curl -X GET 'http://localhost:3000/api/my-orders' \
  -H 'accept: application/json' \
  -H 'x-client-type: ios'
```

---

## 🛠️ Endpoints Overview

### Admin Endpoints (`x-client-type: admin`)
- `POST   /api/orders`         – Create order
- `GET    /api/orders`         – List orders (filter by status)
- `GET    /api/orders/{id}`    – Get order by ID
- `PATCH  /api/orders/{id}`    – Update order status (see allowed transitions in docs)
- `DELETE /api/orders/{id}`    – Soft delete (only cancelled orders by default, or force with `ignoreState=true`)

### iOS Endpoints (`x-client-type: ios`)
- `POST   /api/my-orders`         – Create order
- `GET    /api/my-orders`         – List orders (no filtering)
- `GET    /api/my-orders/{id}`    – Get order by ID
- `PATCH  /api/my-orders/{id}`    – Update/cancel order (only if PENDING, see docs)

---

## 📝 Known Limitations
- **No inventory management:** The API does not track flower stock or inventory.
- **No user authentication:** There is no user registration, login, or per-user order history.
- **No pricing logic:** `totalAmount` is computed on the client and trusted by the backend.
- **No payment integration:** No payment or transaction support.
- **No email/SMS notifications:** No built-in notifications for order status changes.
- **No multi-tenancy:** All orders are global; no shop/branch separation.
- **No rate limiting or advanced security:** Only basic header-based client type check.
- **No real-time updates:** No WebSocket or push notification support.

---

## 🧑‍💻 Development & Testing

### Setup
1. Clone the repo & install dependencies:
   ```sh
   git clone ...
   cd flower-order-wolfpack
   npm install
   ```
2. Run migrations & seed data:
   ```sh
   npm run db:init
   npm run seed
   ```
3. Start the dev server:
   ```sh
   npm run dev
   ```

### Testing
- Run all tests:
  ```sh
  npm test
  ```
- Run with coverage:
  ```sh
  npm run test:coverage
  ```

---

## 📦 Publishing & Deployment
- Build for production: `npm run build`
- Start: `npm start`
- All config is in `.env` and `src/data-source.ts`

---

## 📚 Further Improvements (PRs welcome!)
- Add user authentication & per-user order history
- Add inventory/stock management
- Add payment integration
- Add real-time order status updates
- Add rate limiting & advanced security

---

## License
MIT 