import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
        },

        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
        },

        expenseType: {
            type: String,
            enum: [
                "Fuel",
                "Maintenance",
                "Repair",
                "Toll",
                "Parking",
                "Insurance",
                "Other",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        description: String,

        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Expense", expenseSchema);