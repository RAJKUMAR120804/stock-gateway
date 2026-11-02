# 🛒 Amazon Clone with Customer Details & Simulated Payment Gateway

A full-stack e-commerce demo built with **React (Vite) + Tailwind CSS + Node.js (Express) + MongoDB (Mongoose)**.

---

## 🌟 Features

1. **Amazon UI & Product Store**:
   - Amazon navigation bar (`amazon.in`), location indicator, search bar, and cart count.
   - Product cards with star ratings, reviews, Prime badges, discount pricing, and "Add to Cart".

2. **Customer Purchase Details**:
   - Capture customer information: Full Name, Email, Mobile number, Flat/Street, City, State, and PIN code.
   - Stored in the MongoDB database (`Customer` schema).

3. **Simulated Payment Gateway (Amazon Pay)**:
   - Multiple payment options:
     - 💳 **Credit / Debit Cards** (with test auto-fill)
     - 📱 **UPI** (Google Pay, PhonePe, Paytm)
     - 🏛️ **Net Banking** (HDFC, SBI, ICICI, Axis)
     - 💵 **Cash on Delivery**
   - Realistic gateway delay simulation, payment verification, and unique Transaction ID (`TXN-PAY-...`).

4. **Customer Orders & Receipts**:
   - Order receipt view with generated Order ID (`AMZ-...`) and tracking info.
   - **Returns & Orders Tab**: Real-time list of all purchased orders fetched from the Express API (`GET /api/orders`).

---

## 🚀 How to Run the Project

### Option A: Running with 2 Terminal Windows (Recommended)

#### Terminal 1 — Start the Backend (Express API)
```powershell
cd "E:\payment gateway\src\server"
npm run dev
```
> Server starts on: **http://localhost:5000**

#### Terminal 2 — Start the Frontend (React + Vite)
```powershell
cd "E:\payment gateway\src\client"
npm run dev
```
> Frontend opens on: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check backend & database connection status |
| `POST` | `/api/pay/process` | Process demo payment & save customer order |
| `GET` | `/api/orders` | Fetch all customer purchases and order history |
| `GET` | `/api/orders/:id` | Fetch specific order receipt |

---

## 🗄️ Database (MongoDB)
- Connects automatically to `mongodb://localhost:27017/amazon_store`.
- If MongoDB is not yet installed or running, the server gracefully falls back to an **In-Memory Store** so you can develop and test without errors!

