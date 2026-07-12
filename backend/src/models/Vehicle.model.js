import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        vehicleName: {
            type: String,
            required: true,
            trim: true,
        },

        model: {
            type: String,
            required: true,
        },

        vehicleType: {
            type: String,
            enum: [
                "Truck",
                "Van",
                "Mini Truck",
                "Pickup",
                "Container",
                "Trailer",
                "Other",
            ],
            required: true,
        },

        maxLoadCapacity: {
            type: Number,
            required: true,
        },

        odometer: {
            type: Number,
            default: 0,
        },

        acquisitionCost: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "Available",
                "OnTrip",
                "InShop",
                "Retired",
            ],
            default: "Available",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Vehicle", vehicleSchema);