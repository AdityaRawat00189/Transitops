import Driver from '../models/driver.model.js';


//fetch all drivers
const getDrivers = async (req, res) => {
    try {
        const id = req.params.id;
        const drivers = await Driver.find();
        return res.status(200).json({message: "Drivers fetched successfully", data: drivers})
    }catch (error) {
        return res.status(500).json({message: "Failed to fetch drivers", error: error.message})
    }
}

//fetch driver by id
const getDriverById = async (req, res) => {
    try {
        const id = req.params.id;
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({message: "Driver not found"});
        }
        return res.status(200).json({message: "Driver fetched successfully", data: driver})
    }catch (error) {
        return res.status(500).json({message: "Failed to fetch driver", error: error.message})
    }
}

//create a new driver
const createDriver = async (req, res) => {
    try {
        const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber } = req.body;
        const driver = await Driver.create({
            name,
            licenseNumber,
            licenseCategory,
            licenseExpiry,
            contactNumber
        })
        return res.status(201).json({message: "Driver created successfully", data: driver})
    }catch (error) {
        return res.status(500).json({message: "Failed to create driver", error: error.message})
    }
}

//update driver by id
const updateDriver = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber } = req.body;    
        const driver = await Driver.findByIdAndUpdate(id, {
            name,
            licenseNumber,
            licenseCategory,    
            licenseExpiry,
            contactNumber
        }, { new: true });
        if (!driver) {
            return res.status(404).json({message: "Driver not found"});
        }
        return res.status(200).json({message: "Driver updated successfully", data: driver})
    }catch (error) {
        return res.status(500).json({message: "Failed to update driver", error: error.message})
    }
}

//delete driver by id
const deleteDriver = async (req, res) => {
    try {
        const id = req.params.id;
        const driver = await Driver.findByIdAndDelete(id);
        if (!driver) {
            return res.status(404).json({message: "Driver not found"});
        }
        return res.status(200).json({message: "Driver deleted successfully", data: driver})
    } catch (error) {
        return res.status(500).json({message: "Failed to delete driver", error: error.message})
    }
}

export { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver };