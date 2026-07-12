import Vehicle from "../models/Vehicle.model.js";

// Get all Vehicles
const getVehicles = async(req, res) => {
    try {
        const vehicles = await Vehicle.find({isDeleted: false});

        return res.status(200).json(vehicles);
    } catch(error) {
        return res.status(500).json({message: "Failed to fetch vehicles", error: error.message})
    }
}

// Add a new Vehicle
const addVehicle = async(req, res) => {
    try {
        const { registrationNumber, vehicleName, model, vehicleType, maxLoadCapacity, status, acquisitionCost } = req.body;

        const vehicleExists = await Vehicle.findOne({ registrationNumber });
        if(vehicleExists) {
            return res.status(200).json("Vehicle is Already Registered")
        }

        const vehicle = await Vehicle.create({
            registrationNumber, 
            vehicleName, 
            model, 
            vehicleType, 
            maxLoadCapacity, 
            status, 
            acquisitionCost 
        })

        return res.status(201).json(vehicle);
    }catch(error) {
        return res.status(500).json({message: "Failed to Add vehicles", error: error.message})
    }
}

const updateVehicle = async(req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const { registrationNumber, vehicleName, model, vehicleType, maxLoadCapacity, status, acquisitionCost, } = req.body;

        if (!id) {
        return res.status(400).json({ message: "Vehicle ID is required" });
        }
        
        const updates = {
            ...(registrationNumber && { registrationNumber }),
            ...(vehicleName && { vehicleName }),
            ...(model && { model }),
            ...(vehicleType && { vehicleType }),
            ...(maxLoadCapacity && { maxLoadCapacity }),
            ...(status && { status }),
            ...(acquisitionCost && { acquisitionCost }),
        };

        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true, });

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        return res.status(200).json({message: "Vehicle updated successfully", vehicle: updatedVehicle,});
        
    } catch (error) {
        return res.status(500).json({message: "Failed to Update Vehicle", error: error.message})
    }
}

const deleteVehicle = async(req, res) => {
    try {
        const {id} = req.params;

        if (!id) {
            return res.status(400).json({ message: "Vehicle ID is required" });
        }

        const vehicle = await Vehicle.findByIdAndUpdate( id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        return res.status(200).json({
            message: "Vehicle soft deleted successfully",
            vehicle,
        });
    } catch (error) {
        console.error("Soft Delete Error:", error);
        res.status(500).json({ message: "Failed to soft delete vehicle" });
    }
}

// const getVehicle

export { getVehicles, addVehicle, updateVehicle, deleteVehicle};