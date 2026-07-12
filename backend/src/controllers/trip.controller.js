import Trip from "../models/Trip.model.js";
import Driver from "../models/Driver.model.js";
import Vehicle from "../models/Vehicle.model.js";


const createTrip = async(req, res) => {
    try {
        const { source, destination, vehicle, driver, cargoWeight, plannedDistance, } = req.body;

        // Validate required fields
        if ( !source || !destination || !vehicle || !driver || !cargoWeight || !plannedDistance ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }
        // Check vehicle exists
        const vehicleDoc = await Vehicle.findById(vehicle);

        if (!vehicleDoc || vehicleDoc.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        // Check driver exists
        const driverDoc = await Driver.findById(driver);

        if (!driverDoc) {
            return res.status(404).json({
                success: false,
                message: "Driver not found.",
            });
        }

        // Vehicle should not be retired
        if (vehicleDoc.status === "Retired") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is retired.",
            });
        }

        // Driver should not be suspended
        if (driverDoc.status === "Suspended") {
            return res.status(400).json({
                success: false,
                message: "Driver is suspended.",
            });
        }

        // Check vehicle already assigned to another active trip
        const vehicleTrip = await Trip.findOne({
            vehicle,
            status: { $in: ["Draft", "Dispatched"] },
        });

        if (vehicleTrip) {
            return res.status(400).json({
                success: false,
                message: "Vehicle already assigned to another trip.",
            });
        }

        // Check driver already assigned
        const driverTrip = await Trip.findOne({
            driver,
            status: { $in: ["Draft", "Dispatched"] },
        });

        if (driverTrip) {
            return res.status(400).json({
                success: false,
                message: "Driver already assigned to another trip.",
            });
        }

        const trip = await Trip.create({
            source,
            destination,
            vehicle,
            driver,
            cargoWeight,
            plannedDistance,
            status: "Draft",
        });

        return res.status(201).json({
            success: true,
            message: "Trip created successfully.",
            data: trip,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

const dispatchTrip = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { d} = req.params;

        // Find Trip
        const trip = await Trip.findById(id).session(session);

        if (!trip) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Trip not found."
            });
        }

        // Only Draft trips can be dispatched
        if (trip.status !== "Draft") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Only draft trips can be dispatched."
            });
        }

        // Find Vehicle
        const vehicle = await Vehicle.findById(trip.vehicle).session(session);

        if (!vehicle) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Vehicle not found."
            });
        }

        // Find Driver
        const driver = await Driver.findById(trip.driver).session(session);

        if (!driver) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Driver not found."
            });
        }

        // Vehicle Validations
        if (vehicle.status === "Retired") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Vehicle is retired."
            });
        }

        if (vehicle.status === "InShop") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Vehicle is under maintenance."
            });
        }

        if (vehicle.status === "OnTrip") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Vehicle is already on another trip."
            });
        }

        // Driver Validations
        if (driver.status === "Suspended") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Driver is suspended."
            });
        }

        if (driver.status === "OffDuty") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Driver is off duty."
            });
        }

        if (driver.status === "OnTrip") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Driver is already on another trip."
            });
        }

        // License Validation
        if (driver.licenseExpiry < new Date()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Driver license has expired."
            });
        }

        // Cargo Validation
        if (trip.cargoWeight > vehicle.maxLoadCapacity) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Cargo exceeds vehicle capacity."
            });
        }

        // Update Trip
        trip.status = "Dispatched";
        trip.dispatchTime = new Date();
        trip.startOdometer = vehicle.odometer;

        // Update Vehicle
        vehicle.status = "OnTrip";

        // Update Driver
        driver.status = "OnTrip";

        await trip.save({ session });
        await vehicle.save({ session });
        await driver.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Trip dispatched successfully.",
            data: trip
        });

    } catch (error) {

        await session.abortTransaction();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    } finally {
        session.endSession();
    }
}

const completeTrip = async (req, res) => {
        const session = await mongoose.startSession();

    try {

        session.startTransaction();
        const {id} = req.params;

        const {
            endOdometer,
            fuelConsumed,
            revenue
        } = req.body;

        // Find Trip
        const trip = await Trip.findById(id).session(session);

        if (!trip) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Trip not found."
            });
        }

        // Only dispatched trips can be completed
        if (trip.status !== "Dispatched") {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Only dispatched trips can be completed."
            });
        }

        // Find Vehicle
        const vehicle = await Vehicle.findById(trip.vehicle).session(session);

        if (!vehicle) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Vehicle not found."
            });
        }

        // Find Driver
        const driver = await Driver.findById(trip.driver).session(session);

        if (!driver) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Driver not found."
            });
        }

        // Validate input
        if ( endOdometer == null || fuelConsumed == null || revenue == null ) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // End odometer validation
        if (endOdometer < trip.startOdometer) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "End odometer cannot be less than start odometer."
            });
        }

        // Calculate actual distance
        const actualDistance =
            endOdometer - trip.startOdometer;

        // Update Trip
        trip.endOdometer = endOdometer;
        trip.actualDistance = actualDistance;
        trip.fuelConsumed = fuelConsumed;
        trip.revenue = revenue;
        trip.completionTime = new Date();
        trip.status = "Completed";

        // Update Vehicle
        vehicle.odometer = endOdometer;
        vehicle.status = "Available";

        // Update Driver
        driver.status = "Available";

        await trip.save({ session });
        await vehicle.save({ session });
        await driver.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Trip completed successfully.",
            data: trip
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    } finally {
        session.endSession();
    }
}
const cancelTrip = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const id = req.params.id;
        const trip = await Trip.findById(id);
        session.startTransaction();

        const driverId = trip.driver;
        const driver = await Driver.findById(driverId);
        const vechicleId = trip.vehicle;
        const vehicle = await Vehicle.findById(vechicleId);

        if (!trip) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Trip not found."
            });
        }

        
        // Only Draft or Dispatched or completed trips can be cancelled

        //check it is already cancelled
        if(trip.status === "Cancelled"){
            return res.status(400).json({
                success: false,
                message: "Trip is already cancelled."
            });
        }
        

        //cancel the trip
        trip.status = "Cancelled";
        await trip.save();
        driver.status = "Available";
        vehicle.status = "Available";
        await driver.save();
        await vehicle.save();
        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            message: "Trip cancelled successfully.",
            data: trip
        });

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    } finally {
        session.endSession();
    }
}

const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find().populate("vehicle").populate("driver");
        return res.status(200).json({
            success: true,
            message: "Trips fetched successfully.",
            data: trips
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const getTripById = async (req, res) => {
    try {
        const id = req.params.id;
        const trip = await Trip.findById(id).populate("vehicle").populate("driver");
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Trip fetched successfully.",
            data: trip
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export { createTrip, dispatchTrip, completeTrip, cancelTrip, getTrips, getTripById };