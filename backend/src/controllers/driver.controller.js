import Driver from '../models/Driver.model.js';
import Trip from '../models/Trip.model.js';


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
const getDriverTrips = async (req, res) => {
    try {
        const driverId = req.params.id;
        const trips = await Trip.find({ driver: driverId }).populate("vehicle").populate("driver");
        return res.status(200).json({ message: "Trips fetched successfully", data: trips });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch trips", error: error.message });
    }
};
const getDriverDispatchedTrips = async (req, res) => {
    try {
        const driverId = req.params.id;
        const trips = await Trip.find({ driver: driverId, status: "Dispatched" }).populate("vehicle").populate("driver");
        return res.status(200).json({ message: "Dispatched trips fetched successfully", data: trips });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch dispatched trips", error: error.message });
    }
};
export { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver, getDriverTrips, getDriverDispatchedTrips };