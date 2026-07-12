import api from './axios';

// Vehicles
export const getVehicles = () => api.get('/vehicles');
export const createVehicle = (data) => api.post('/vehicles', data);

// Drivers
export const getDrivers = () => api.get('/drivers');
export const getDriverById = (id) => api.get(`/drivers/${id}`);
export const createDriver = (data) => api.post('/drivers', data);
export const updateDriver = (id, data) => api.patch(`/drivers/${id}`, data);
export const getDriverTrips = (id) => api.get(`/drivers/${id}/trips`);
export const getDriverDispatchedTrips = (id) => api.get(`/drivers/${id}/dispatched-trips`);

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
export const createExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
// Analytics
export const getAnalytics = () => api.get('/analytics');

// Fuel
export const getFuelLogs = () => api.get('/fuel');
export const createFuelLog = (data) => api.post('/fuel', data);
export const deleteFuelLog = (id) => api.delete(`/fuel/${id}`);

// Location
export const getLocationLogs = (tripId) => api.get(`/location/trips/${tripId}/location-logs`);
