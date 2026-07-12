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

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const {
            vehicle,
            maintenanceType,
            description,
            cost,
        } = req.body;

        // Validate request body
        if (!vehicle || !maintenanceType || !description || cost == null) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Find vehicle
        const vehicleDoc = await Vehicle.findById(vehicle).session(session);

        if (!vehicleDoc) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        // Vehicle already retired
        if (vehicleDoc.status === "Retired") {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Retired vehicle cannot undergo maintenance.",
            });
        }

        // Already in maintenance
        if (vehicleDoc.status === "InShop") {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Vehicle is already under maintenance.",
            });
        }

        // Vehicle currently on trip
        if (vehicleDoc.status === "OnTrip") {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Vehicle is currently on a trip.",
            });
        }

        // Create maintenance record
        const maintenance = await Maintenance.create(
            [
                {
                    vehicle,
                    maintenanceType,
                    description,
                    cost,
                    status: "Open",
                },
            ],
            { session }
        );

        // Update vehicle status
        vehicleDoc.status = "InShop";

        await vehicleDoc.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Maintenance record created successfully.",
            data: maintenance[0],
        });

    } catch (error) {

        await session.abortTransaction();

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    } finally {

        session.endSession();

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

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const { id } = req.params;

        // Find maintenance record
        const maintenance = await Maintenance.findById(id).session(session);

        if (!maintenance) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Maintenance record not found.",
            });
        }

        // Already completed
        if (maintenance.status === "Completed") {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Maintenance is already completed.",
            });
        }

        // Find vehicle
        const vehicle = await Vehicle.findById(maintenance.vehicle).session(session);

        if (!vehicle) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        // Update maintenance
        maintenance.status = "Completed";

        // Restore vehicle status
        // (Don't change if vehicle has been retired)
        if (vehicle.status !== "Retired") {
            vehicle.status = "Available";
        }

        await maintenance.save({ session });
        await vehicle.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Maintenance completed successfully.",
            data: maintenance,
        });

    } catch (error) {

        await session.abortTransaction();

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    } finally {

        session.endSession();

    }
};

export {getAllMaintenance, createMaintenance, getMaintenanceById, closeMaintenance};