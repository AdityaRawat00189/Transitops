import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authroutes.js";
import vehicleRoutes from "./src/routes/vehicle.routes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Backend server is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
