import api from './axios';

// Vehicles
export const getVehicles = () => api.get('/vehicles');
export const createVehicle = (data) => api.post('/vehicles', data);

// Drivers
export const getDrivers = () => api.get('/drivers');
export const createDriver = (data) => api.post('/drivers', data);

// Trips / Dispatch
export const getTrips = () => api.get('/trips');
export const createTrip = (data) => api.post('/trips', data);
export const dispatchTrip = (id) => api.patch(`/trips/dispatch/${id}`);
export const completeTrip = (id, data) => api.patch(`/trips/complete/${id}`, data);
// Maintenance
export const getMaintenanceLogs = () => api.get('/maintenance');
export const logMaintenance = (data) => api.post('/maintenance', data);
export const closeMaintenance = (id) => api.patch(`/maintenance/${id}`);
export const getExpenses = () => api.get('/expenses');

// Analytics
export const getAnalytics = () => api.get('/analytics');
