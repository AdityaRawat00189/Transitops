import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { socket, connectSocket, disconnectSocket } from '@/api/socket';
import { getLocationLogs } from '@/api/services';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for trucks
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/711/711200.png', // A simple truck icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper component to center map around multiple markers
function MapBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
}

export function LiveMap({ activeTrips }) {
  const [locations, setLocations] = useState({});
  const [paths, setPaths] = useState({});

  useEffect(() => {
    connectSocket();

    // Set initial locations from activeTrips
    const initialLocations = {};
    activeTrips.forEach(async trip => {
      if (trip.currentLocation?.lat && trip.currentLocation?.lng) {
        initialLocations[trip._id] = { lat: trip.currentLocation.lat, lng: trip.currentLocation.lng };
      }
      socket.emit('join-room', trip._id);
      
      // Fetch historical path
      try {
        const res = await getLocationLogs(trip._id);
        if (res.data?.data) {
          const coords = res.data.data.map(log => [log.lat, log.lng]);
          setPaths(prev => ({ ...prev, [trip._id]: coords }));
        }
      } catch (err) {
        console.error("Failed to load historical path for trip:", trip._id);
      }
    });
    setLocations(initialLocations);

    // Listen for real-time updates
    const handleLocationUpdate = (data) => {
      setLocations(prev => ({
        ...prev,
        [data.tripId]: { lat: data.lat, lng: data.lng }
      }));
      setPaths(prev => {
        const existing = prev[data.tripId] || [];
        return {
          ...prev,
          [data.tripId]: [...existing, [data.lat, data.lng]]
        };
      });
    };

    socket.on('location', handleLocationUpdate);

    return () => {
      socket.off('location', handleLocationUpdate);
      // Do NOT disconnect socket here to prevent race conditions when component re-renders
    };
  }, [JSON.stringify(activeTrips.map(t => t._id))]);

  const markers = activeTrips.filter(trip => locations[trip._id]).map(trip => ({
    id: trip._id,
    vehicle: trip.vehicle?.registrationNumber || 'Unknown Vehicle',
    driver: trip.driver?.name || 'Unknown Driver',
    destination: trip.destination,
    position: locations[trip._id]
  }));

  const defaultCenter = [39.8283, -98.5795]; // Center of US as fallback

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }} // Matches Midnight Glass
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme map tiles
        />
        
        {markers.map(marker => (
          <React.Fragment key={marker.id}>
            <Marker 
              position={[marker.position.lat, marker.position.lng]}
              icon={truckIcon}
            >
              <Popup className="custom-popup">
                <div className="text-slate-900 font-sans">
                  <p className="font-bold text-sm mb-1">{marker.vehicle}</p>
                  <p className="text-xs mb-1"><span className="font-semibold">Driver:</span> {marker.driver}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Heading to: {marker.destination}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Draw the route path the truck has taken */}
            {paths[marker.id] && paths[marker.id].length > 0 && (
              <Polyline 
                positions={[...paths[marker.id], [marker.position.lat, marker.position.lng]]}
                pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
              />
            )}
          </React.Fragment>
        ))}

        {markers.length > 0 && <MapBounds positions={markers.map(m => m.position)} />}
      </MapContainer>
    </div>
  );
}
