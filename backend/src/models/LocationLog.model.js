import mongoose from "mongoose";

const locationLogSchema = new mongoose.Schema({
  trip: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "Trip", required: true 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle", 
    required: true 
  },
  lat: Number,
  lng: Number,
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.model("LocationLog", locationLogSchema);