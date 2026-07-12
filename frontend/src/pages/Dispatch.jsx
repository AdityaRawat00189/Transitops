import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Navigation, Package, Truck, User, Send, CheckCircle2, XCircle, Clock, Map as MapIcon, Maximize2 } from 'lucide-react';
import { getTrips, createTrip, dispatchTrip, completeTrip, getVehicles, getDrivers } from '@/api/services';
import { socket, connectSocket, disconnectSocket } from '@/api/socket';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveMap } from '@/components/LiveMap';

export function Dispatch() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedMapTrip, setSelectedMapTrip] = useState(null);
  const { toast } = useToast();
  const { role, user } = useAuth();
  const [completeData, setCompleteData] = useState({ id: null, endOdometer: '', fuelConsumed: '', revenue: '' });
  const [trackingTripId, setTrackingTripId] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (watchIdRef.current) clearInterval(watchIdRef.current);
      disconnectSocket();
    };
  }, []);

  const fetchData = async () => {
    try {
      if (role === 'Driver') {
        const tripsRes = await getTrips();
        setTrips(tripsRes.data?.data || tripsRes.data || []);
        setVehicles([]);
        setDrivers([]);
      } else {
        const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
          getTrips(),
          getVehicles(),
          getDrivers()
        ]);
        setTrips(tripsRes.data?.data || tripsRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setDrivers(driversRes.data?.data || driversRes.data || []);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch dispatch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = (Array.isArray(drivers) ? drivers : []).filter(d => d.status === 'Available');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Draft': return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', icon: Clock };
      case 'Dispatched': return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: Navigation };
      case 'Completed': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 };
      case 'Cancelled': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: XCircle };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', icon: Truck };
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTrip = {
      source: formData.get('source'),
      destination: formData.get('destination'),
      vehicle: formData.get('vehicle'),
      driver: formData.get('driver'),
      cargoWeight: Number(formData.get('cargoWeight')),
      plannedDistance: Number(formData.get('plannedDistance')),
    };
    
    try {
      await createTrip(newTrip);
      toast({ title: 'Success', description: 'Trip drafted successfully' });
      setIsWizardOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to draft trip', variant: 'destructive' });
    }
  };

  const handleDispatch = async (tripId) => {
    try {
      await dispatchTrip(tripId);
      toast({ title: 'Dispatched', description: 'Trip is now underway' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to dispatch', variant: 'destructive' });
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      await completeTrip(completeData.id, {
        endOdometer: Number(completeData.endOdometer),
        fuelConsumed: Number(completeData.fuelConsumed),
        revenue: Number(completeData.revenue)
      });
      toast({ title: 'Completed', description: 'Trip marked as completed' });
      setCompleteData({ id: null, endOdometer: '', fuelConsumed: '', revenue: '' });
      if (trackingTripId === completeData.id) {
        if (watchIdRef.current) clearInterval(watchIdRef.current);
        setTrackingTripId(null);
        setWatchId(null);
        disconnectSocket();
      }
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to complete', variant: 'destructive' });
    }
  };

  const toggleTracking = (tripId) => {
    if (trackingTripId === tripId) {
      if (watchIdRef.current) clearInterval(watchIdRef.current);
      setTrackingTripId(null);
      setWatchId(null);
      disconnectSocket();
      toast({ title: 'Tracking Stopped', description: 'Location sharing ended.' });
    } else {
      if (!navigator.geolocation) {
        toast({ title: 'Error', description: 'Geolocation not supported', variant: 'destructive' });
        return;
      }

      connectSocket();
      
      let simulatedLat = null;
      let simulatedLng = null;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          simulatedLat = position.coords.latitude;
          simulatedLng = position.coords.longitude;
          socket.emit('location-update', { tripId, lat: simulatedLat, lng: simulatedLng });
        },
        (error) => {
          toast({ title: 'Error', description: 'Could not get location', variant: 'destructive' });
        },
        { enableHighAccuracy: true }
      );

      const id = setInterval(() => {
        if (simulatedLat && simulatedLng) {
          simulatedLat += (Math.random() - 0.5) * 0.0002;
          simulatedLng += (Math.random() - 0.5) * 0.0002;
          socket.emit('location-update', { tripId, lat: simulatedLat, lng: simulatedLng });
        }
      }, 10000);

      setWatchId(id);
      watchIdRef.current = id;
      setTrackingTripId(tripId);
      toast({ title: 'Tracking Started', description: 'Location updating every 10s.' });
    }
  };

  const displayTrips = role === 'Driver' 
    ? trips.filter(t => t.driver?._id === user?._id || t.driver === user?._id || t.driver?.name === user?.name)
    : trips;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
               <Send className="w-6 h-6 text-cyan-400" />
             </div>
             Dispatch Control
          </h1>
          <p className="text-slate-400 mt-2">Coordinate routes and monitor active deployments.</p>
        </motion.div>
        
        {role === 'FleetManager' && (
          <motion.div variants={item}>
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                  <Navigation className="w-5 h-5" /> New Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-slate-950 text-white border-white/10 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Smart Dispatch Wizard</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Configure a new trip route, payload, and assignments.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTrip} className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 font-medium text-slate-300"><MapPin className="w-4 h-4 text-emerald-500" /> Origin</label>
                      <Input name="source" placeholder="Origin City/Depot" required className="bg-slate-900/50 border-white/10 text-white focus:border-cyan-500/50" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 font-medium text-slate-300"><Navigation className="w-4 h-4 text-rose-500" /> Destination</label>
                      <Input name="destination" placeholder="Destination City/Depot" required className="bg-slate-900/50 border-white/10 text-white focus:border-cyan-500/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 font-medium text-slate-300"><Package className="w-4 h-4 text-indigo-400" /> Payload (Tons)</label>
                      <Input name="cargoWeight" type="number" step="0.1" placeholder="e.g. 15.5" required className="bg-slate-900/50 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 font-medium text-slate-300"><Navigation className="w-4 h-4 text-amber-500" /> Distance (km)</label>
                      <Input name="plannedDistance" type="number" placeholder="e.g. 450" required className="bg-slate-900/50 border-white/10 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 font-medium text-slate-300"><Truck className="w-4 h-4 text-slate-400" /> Vehicle</label>
                      <select name="vehicle" className="w-full bg-slate-900/50 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" required>
                        <option value="" className="bg-slate-900">Select Available Vehicle</option>
                        {availableVehicles.map(v => (
                          <option key={v._id} value={v._id} className="bg-slate-900">{v.registrationNumber} ({v.maxLoadCapacity}T)</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 font-medium text-slate-300"><User className="w-4 h-4 text-slate-400" /> Driver</label>
                      <select name="driver" className="w-full bg-slate-900/50 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" required>
                        <option value="" className="bg-slate-900">Select Available Driver</option>
                        {availableDrivers.map(d => (
                          <option key={d._id} value={d._id} className="bg-slate-900">{d.name} ({d.licenseNumber})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-4">
                    <Button type="button" variant="outline" className="border-white/10 text-slate-300 hover:text-white" onClick={() => setIsWizardOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">Draft Trip</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="h-64 bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : displayTrips.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayTrips.map((trip) => {
              const statusStyle = getStatusStyle(trip.status);
              const StatusIcon = statusStyle.icon;
              return (
                <motion.div key={trip._id} variants={item} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Card className="glass-card h-full flex flex-col group relative overflow-hidden hover:-translate-y-1 transition-all duration-300">
                    {trip.status === 'Dispatched' && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                    )}
                    
                    <CardHeader className="pb-4 border-b border-white/5 bg-slate-900/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">TRIP ID</p>
                          <CardTitle className="text-lg text-white">#{trip._id.slice(-6).toUpperCase()}</CardTitle>
                        </div>
                        <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1.5 py-1 px-2.5`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${trip.status === 'Dispatched' ? 'animate-pulse' : ''}`} />
                          {trip.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-5 flex-1 space-y-5">
                      <div className="flex items-center justify-between relative">
                        <div className="w-[45%]">
                          <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Origin</p>
                          <p className="text-sm text-slate-200 font-semibold truncate" title={trip.source}>{trip.source}</p>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 flex items-center justify-center w-full">
                           <div className="h-[1px] bg-slate-700 w-[20%] absolute"></div>
                           <Navigation className={`w-4 h-4 text-slate-500 relative z-10 ${trip.status === 'Dispatched' ? 'text-cyan-400' : ''}`} />
                        </div>
                        <div className="w-[45%] text-right">
                          <p className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-end gap-1"><MapPin className="w-3 h-3 text-rose-500" /> Dest</p>
                          <p className="text-sm text-slate-200 font-semibold truncate" title={trip.destination}>{trip.destination}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><Truck className="w-3 h-3" /> Vehicle</p>
                          <p className="text-sm text-slate-300 font-medium">{trip.vehicle?.registrationNumber || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><User className="w-3 h-3" /> Driver</p>
                          <p className="text-sm text-slate-300 font-medium">{trip.driver?.name || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><Package className="w-3 h-3" /> Payload</p>
                          <p className="text-sm text-slate-300 font-medium">{trip.cargoWeight}T</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Dist</p>
                          <p className="text-sm text-slate-300 font-medium">{trip.plannedDistance} km</p>
                        </div>
                      </div>
                    </CardContent>

                    {((trip.status === 'Draft' && role === 'FleetManager') || (trip.status === 'Dispatched')) && (
                      <CardFooter className="pt-0 pb-4 px-6 border-t border-white/5 mt-2 bg-black/10 rounded-b-xl flex flex-col gap-3">
                        {trip.status === 'Draft' && role === 'FleetManager' && (
                          <Button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" onClick={() => handleDispatch(trip._id)}>
                            <Send className="w-4 h-4 mr-2" /> Dispatch Now
                          </Button>
                        )}
                        {trip.status === 'Dispatched' && (
                          <>
                            <Button 
                              variant="outline"
                              className="w-full mt-4 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                              onClick={() => { setSelectedMapTrip(trip); setMapModalOpen(true); }}
                            >
                              <Maximize2 className="w-4 h-4 mr-2" /> View Live Map
                            </Button>

                            <div className="flex gap-2 w-full">
                              {role === 'Driver' && (
                                <Button 
                                  variant={trackingTripId === trip._id ? "destructive" : "default"}
                                  className={`flex-1 shadow-lg ${trackingTripId === trip._id ? 'bg-rose-500 hover:bg-rose-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white`} 
                                  onClick={() => toggleTracking(trip._id)}
                                >
                                  <MapIcon className={`w-4 h-4 mr-2 ${trackingTripId === trip._id ? 'animate-pulse' : ''}`} /> 
                                  {trackingTripId === trip._id ? 'Stop Tracking' : 'Start Tracking'}
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20`} onClick={() => setCompleteData({ ...completeData, id: trip._id })}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Route
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-950 text-white border-white/10">
                                <DialogHeader>
                                  <DialogTitle>Route Debrief</DialogTitle>
                                  <DialogDescription className="text-slate-400">Log closing metrics for Trip #{trip._id.slice(-6).toUpperCase()}</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleComplete} className="space-y-4 pt-4">
                                  <div className="space-y-2 text-sm">
                                    <label className="text-slate-300">Final Odometer (km)</label>
                                    <Input className="bg-slate-900/50 border-white/10 text-white" value={completeData.endOdometer} onChange={(e) => setCompleteData({...completeData, endOdometer: e.target.value})} type="number" required />
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <label className="text-slate-300">Fuel Consumed (Liters)</label>
                                    <Input className="bg-slate-900/50 border-white/10 text-white" value={completeData.fuelConsumed} onChange={(e) => setCompleteData({...completeData, fuelConsumed: e.target.value})} type="number" required />
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <label className="text-slate-300">Total Revenue Generated ($)</label>
                                    <Input className="bg-slate-900/50 border-white/10 text-white" value={completeData.revenue} onChange={(e) => setCompleteData({...completeData, revenue: e.target.value})} type="number" required />
                                  </div>
                                  <div className="flex justify-end pt-2">
                                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Sign Off Route</Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                            </div>
                          </>
                        )}
                      </CardFooter>
                    )}
                  </Card>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <motion.div variants={item} className="glass-panel p-12 flex flex-col items-center justify-center text-center rounded-2xl border-dashed mt-8">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No active routes</h3>
          <p className="text-slate-400 max-w-sm">
            There are no trips currently scheduled or in progress. Create a new trip to get started.
          </p>
        </motion.div>
      )}

      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[85vh] bg-slate-950 border-white/10 text-white p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 border-b border-white/5 bg-slate-900/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MapIcon className="w-5 h-5 text-emerald-400" />
              Live Route tracking
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Trip #{selectedMapTrip?._id?.slice(-6).toUpperCase()} • {selectedMapTrip?.source} to {selectedMapTrip?.destination}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-900 relative">
             {selectedMapTrip && <LiveMap activeTrips={[selectedMapTrip]} />}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
