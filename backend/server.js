import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authroutes.js";
import vehicleRoutes from "./src/routes/vehicle.routes.js";
import driverRoutes from "./src/routes/driver.routes.js";
import tripRoutes from "./src/routes/trip.routes.js";
import maintenanceRoutes from './src/routes/maintenance.route.js'
import fuelRoutes from './src/routes/fuel.route.js'
import expenseRoutes from './src/routes/expense.route.js'
import {configureSockets} from './src/config/socket.config.js'
import locationRoutes from './src/routes/location.routes.js'
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
configureSockets(server);

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
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/location", locationRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
