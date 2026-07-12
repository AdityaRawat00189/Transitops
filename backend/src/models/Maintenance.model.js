import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
    {
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },

        maintenanceType: {
            type: String,
            required: true,
        },

        description: String,

        cost: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: [
                "Open",
                "Completed",
            ],
            default: "Open",
        },

        openedAt: {
            type: Date,
            default: Date.now,
        },

        closedAt: Date,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Maintenance", maintenanceSchema);