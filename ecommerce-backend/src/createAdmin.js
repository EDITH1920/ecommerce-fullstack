import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.model.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  const existing = await User.findOne({ email: "admin@shop.com" });

  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email: "admin@shop.com",
    password: hashedPassword,
    role: "ADMIN",
  });

  console.log("✅ Admin created with password: admin123");
  process.exit();
}

createAdmin();
