import FuelLog from "../models/FuelLog.model.js";
import mongoose from "mongoose";

const createFuelLog = async (req, res) => {
    try {
        const { vehicle, trip, liters, cost, date } = req.body;

        const fuelLog = await FuelLog.create({
            vehicle,
            trip,
            liters,
            cost,
            date,
        });
        
        return res.status(201).json({ message: "Fuel log created successfully", data: fuelLog });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create fuel log", error: error.message });
    }
}

const getFuelLogs = async (req, res) => {
    try {
        const fuelLogs = await FuelLog.find().populate('vehicle').populate('trip');
        return res.status(200).json({ message: "Fuel logs fetched successfully", data: fuelLogs });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch fuel logs", error: error.message });
    }
}

const deleteFuelLog = async (req, res) => {
    try {
        const id = req.params.id;
        const fuelLog = await FuelLog.findByIdAndDelete(id);
        if (!fuelLog) {
            return res.status(404).json({ message: "Fuel log not found" });
        }
        return res.status(200).json({ message: "Fuel log deleted successfully", data: fuelLog });
    }catch (error) {
        return res.status(500).json({ message: "Failed to delete fuel log", error: error.message });
    }
}

const totalFuel = async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;
        const totalCost = await FuelLog.aggregate([
            { $match: { vehicle: new mongoose.Types.ObjectId(vehicleId) } },
            { $group: { _id: vehicleId, totalCost: { $sum: "$cost" }, totalLiters: { $sum: "$liters" } } }
        ]);

        return res.status(200).json({ message: "Total fuel cost calculated successfully", data: totalCost[0] || { totalCost: 0, totalLiters: 0 } });
    } catch (error) {
        return res.status(500).json({ message: "Failed to calculate total fuel cost", error: error.message });
    }
}

export { createFuelLog, getFuelLogs, deleteFuelLog, totalFuel };