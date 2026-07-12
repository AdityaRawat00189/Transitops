import mongoose from "mongoose";
import Maintenance from "../models/Maintenance.model.js";
import Vehicle from "../models/Vehicle.model.js";

const getAllMaintenance = async (req, res) => {
    try {

        const maintenances = await Maintenance.find()
            .populate(
                "vehicle",
                "registrationNumber vehicleName model status"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: maintenances.length,
            data: maintenances,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

const createMaintenance = async (req, res) => {
    try {
        const {
            vehicle,
            maintenanceType,
            description,
            cost,
        } = req.body;

        // Validate request body
        if (!vehicle || !maintenanceType || !description || cost == null) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Find vehicle
        const vehicleDoc = await Vehicle.findById(vehicle);

        if (!vehicleDoc) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        // Vehicle already retired
        if (vehicleDoc.status === "Retired") {
            return res.status(400).json({
                success: false,
                message: "Retired vehicle cannot undergo maintenance.",
            });
        }

        // Already in maintenance
        if (vehicleDoc.status === "InShop") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is already under maintenance.",
            });
        }

        // Vehicle currently on trip
        if (vehicleDoc.status === "OnTrip") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is currently on a trip.",
            });
        }

        // Create maintenance record
        const maintenance = await Maintenance.create({
            vehicle,
            maintenanceType,
            description,
            cost,
            status: "Open",
        });

        // Update vehicle status
        vehicleDoc.status = "InShop";
        await vehicleDoc.save();

        return res.status(201).json({
            success: true,
            message: "Maintenance record created successfully.",
            data: maintenance,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getMaintenanceById = async (req, res) => {
    try {

        const { id } = req.params;

        const maintenance = await Maintenance.findById(id)
            .populate(
                "vehicle",
                "registrationNumber vehicleName model status"
            );

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: maintenance,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

const closeMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        // Find maintenance record
        const maintenance = await Maintenance.findById(id);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found.",
            });
        }

        // Already completed
        if (maintenance.status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Maintenance is already completed.",
            });
        }

        // Find vehicle
        const vehicle = await Vehicle.findById(maintenance.vehicle);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        // Update maintenance
        maintenance.status = "Completed";

        // Restore vehicle status
        if (vehicle.status !== "Retired") {
            vehicle.status = "Available";
        }

        await maintenance.save();
        await vehicle.save();

        return res.status(200).json({
            success: true,
            message: "Maintenance completed successfully.",
            data: maintenance,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export {getAllMaintenance, createMaintenance, getMaintenanceById, closeMaintenance};