import Trip from "../models/trip.model.js";
import Driver from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";


createTrip()



getTrips()

getTripById()



const dispatchTrip = async (req,res) => {
    try{
        const tripId = req.params.id;
        const trip = await Trip.findById(tripId);

        if(!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        if(trip.status !== "Draft") {
            return res.status(400).json({ message: "Only draft trips can be dispatched" });
        }
        const driverId = req.body.driverId;
        const driver = await Driver.findById(driverId);
        if(driver.status !== "Available") {
            return res.status(400).json({ message: "Driver is not available" });
        }
        const vehicleId = req.body.vehicleId;
        const vehicle = await Vehicle.findById(vehicleId);
        if(vehicle.status !== "Available") {
            return res.status(400).json({ message: "Vehicle is not available" });
        }
        driver.status = "On Trip";
        vehicle.status = "On Trip";
        
        
        await Trip.findByIdAndUpdate(tripId, {
            status: "Dispatched",
            dispatchTime: new Date(),
            driver: driverId,
            vehicle: vehicleId,
        });
        await trip.save();
        await driver.save();
        await vehicle.save();
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const completeTrip = async (req,res) => {
    try{
        const tripId = req.params.id;
        const trip = await Trip.findById(tripId);

cancelTrip()