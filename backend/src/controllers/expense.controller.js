import expenseModel from '../models/Expense.model.js';

const createExpense = async (req, res) => {
    try {
        const { vehicle, trip, expenseType, amount, description, date } = req.body;
        const expense = await expenseModel.create({
            vehicle,
            trip,
            expenseType,
            amount,
            description,
            date
        });
        return res.status(201).json({ message: "Expense created successfully", data: expense });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create expense", error: error.message });
    }
}

const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseModel.find().populate('vehicle').populate('trip');
        return res.status(200).json({ message: "Expenses fetched successfully", data: expenses });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
    }
}
const deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const expense = await expenseModel.findByIdAndDelete(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        return res.status(200).json({ message: "Expense deleted successfully", data: expense });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete expense", error: error.message });
    }
}

export { createExpense, getExpenses, deleteExpense };