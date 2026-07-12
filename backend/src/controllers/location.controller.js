import moongose from 'mongoose';
import LocationLog from '../models/LocationLog.model.js';
import Trip from '../models/Trip.model.js';

export const getLocationLogs = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const locationLogs = await LocationLog.find({ trip: tripId }).sort({ timestamp: 1 });

    return res.status(200).json({ message: 'Location logs fetched successfully', data: locationLogs });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch location logs', error: error.message });
  }
};
