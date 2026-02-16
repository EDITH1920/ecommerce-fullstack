# 🛒 E-Commerce Backend API

A full-featured **E-commerce Backend API** built using  
**Node.js, Express, MongoDB, and JWT authentication**.

This project supports user authentication, admin management, product catalog,
cart functionality, and order processing.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration & login
- Password hashing using bcrypt
- JWT-based authentication
- Role-based access (USER / ADMIN)

### 🗂 Categories
- Create category (Admin only)
- Get all categories (Public)

### 🛍 Products
- Create product (Admin only)
- Get all products
- Get products by category
- Product stock management

### 🛒 Cart
- Add product to cart
- Update cart item quantity
- Remove product from cart
- User-specific cart

### 📦 Orders
- Place order from cart
- Reduce product stock on order
- Clear cart after checkout
- Get user order history

---

## 🧠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas / Compass)
- **Authentication:** JWT
- **ORM:** Mongoose

---

## 📁 Project Structure

src/
├── models/
├── controllers/
├── routes/
├── middlewares/
├── utils/
├── app.js
└── server.js

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key