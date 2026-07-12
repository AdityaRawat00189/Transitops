import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true,
        },

        destination: {
            type: String,
            required: true,
        },

        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },

        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
        },

        cargoWeight: {
            type: Number,
            required: true,
        },

        plannedDistance: {
            type: Number,
            required: true,
        },

        actualDistance: {
            type: Number,
            default: 0,
        },

        revenue: {
            type: Number,
            default: 0,
        },

        fuelConsumed: {
            type: Number,
            default: 0,
        },

        startOdometer: {
            type: Number,
        },

        endOdometer: {
            type: Number,
        },

        dispatchTime: Date,

        completionTime: Date,

        status: {
            type: String,
            enum: [
                "Draft",
                "Dispatched",
                "Completed",
                "Cancelled",
            ],
            default: "Draft",
        },
        currentLocation: {
            lat: Number,
            lng: Number,
            updatedAt: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Trip", tripSchema);