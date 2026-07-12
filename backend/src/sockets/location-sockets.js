import Trip from '../models/Trip.model.js';
import LocationLog from '../models/LocationLog.model.js';
const locationSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join-room', (tripId) => {
            socket.join(`trip:${tripId}`);
        });

        socket.on('location-update', async (data) => {
            try {
                const { tripId, lat, lng } = data;

                const trip = await Trip.findById(tripId);
                if (!trip) {
                    console.error(`Trip with ID ${tripId} not found`);
                    return;
                }
                if (trip.status !== "Dispatched") {
                    console.error(`Trip with ID ${tripId} is not in Dispatched status`);
                    return;
                }

                const updatedAt = new Date();
                await Trip.findByIdAndUpdate(tripId, {
                    currentLocation: { lat, lng, updatedAt },
                });
                await LocationLog.create({ trip: tripId, vehicle: trip.vehicle, lat, lng });
                io.to(`trip:${tripId}`).emit('location', { tripId, lat, lng, updatedAt });
            } catch (error) {
                console.error('Failed to process location update:', error.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export default locationSocket;