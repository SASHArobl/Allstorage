import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

console.log("SERVER FILE LOADED");

dotenv.config();

const app = express();
app.use(express.json());

// Простейший роут
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Подключение к MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/allstorage";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});