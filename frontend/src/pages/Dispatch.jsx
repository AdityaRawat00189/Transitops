import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Navigation, Package, Truck, User, Send } from 'lucide-react';
import { getTrips, createTrip, dispatchTrip, completeTrip, getVehicles, getDrivers } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export function Dispatch() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { toast } = useToast();
  const { role, user } = useAuth();
  const [completeData, setCompleteData] = useState({ id: null, endOdometer: '', fuelConsumed: '', revenue: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        getTrips(),
        getVehicles(),
        getDrivers()
      ]);
      setTrips(tripsRes.data?.data || []);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data?.data || driversRes.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch dispatch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = (Array.isArray(drivers) ? drivers : []).filter(d => d.status === 'Available');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-500/15 text-slate-500 border-slate-500/20';
      case 'Dispatched': return 'bg-cyan-500/15 text-cyan-500 border-cyan-500/20';
      case 'Completed': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20';
      case 'Cancelled': return 'bg-rose-500/15 text-rose-500 border-rose-500/20';
      default: return 'bg-secondary text-secondary-foreground';
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
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to complete', variant: 'destructive' });
    }
  };

  const displayTrips = role === 'Driver' 
    ? trips.filter(t => t.driver?._id === user?._id || t.driver === user?._id)
    : trips;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dispatch Control</h1>
          <p className="text-muted-foreground mt-1">Manage active routes and assignments</p>
        </div>
        
        {role === 'FleetManager' && (
          <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <Navigation className="w-5 h-5" /> New Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle className="text-xl">Smart Dispatch Wizard</DialogTitle>
                <DialogDescription>
                  Configure a new trip route, payload, and assignments.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTrip} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 font-medium"><MapPin className="w-4 h-4 text-emerald-500" /> Source</label>
                    <Input name="source" placeholder="Origin City/Depot" required className="bg-background" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 font-medium"><Navigation className="w-4 h-4 text-rose-500" /> Destination</label>
                    <Input name="destination" placeholder="Destination City/Depot" required className="bg-background" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 font-medium"><Package className="w-4 h-4 text-cyan-500" /> Cargo Weight (Tons)</label>
                    <Input name="cargoWeight" type="number" step="0.1" placeholder="e.g. 15.5" required className="bg-background" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 font-medium"><Navigation className="w-4 h-4 text-amber-500" /> Planned Distance (km)</label>
                    <Input name="plannedDistance" type="number" placeholder="e.g. 450" required className="bg-background" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 font-medium"><Truck className="w-4 h-4" /> Vehicle Assignment</label>
                    <select name="vehicle" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select Available Vehicle</option>
                      {availableVehicles.map(v => (
                        <option key={v._id} value={v._id}>{v.registrationNumber} ({v.maxLoadCapacity}T)</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 font-medium"><User className="w-4 h-4" /> Driver Assignment</label>
                    <select name="driver" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select Available Driver</option>
                      {availableDrivers.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.licenseNumber})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsWizardOpen(false)}>Cancel</Button>
                  <Button type="submit">Draft Trip</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground">Loading trips...</p>
        ) : displayTrips.map((trip) => (
          <Card key={trip._id} className="bg-card border-border hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Trip #{trip._id.slice(-6).toUpperCase()}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {trip.source} 
                    <span className="text-muted-foreground mx-1">→</span>
                    <Navigation className="w-3 h-3" /> {trip.destination}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={getStatusColor(trip.status)}>
                  {trip.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3 h-3" /> Vehicle</span>
                  <p className="font-medium">{trip.vehicle?.registrationNumber || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Driver</span>
                  <p className="font-medium">{trip.driver?.name || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1"><Package className="w-3 h-3" /> Cargo</span>
                  <p className="font-medium">{trip.cargoWeight} Tons</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1"><Navigation className="w-3 h-3" /> Distance</span>
                  <p className="font-medium">{trip.plannedDistance} km</p>
                </div>
              </div>

              {trip.status === 'Draft' && role === 'FleetManager' && (
                <div className="pt-2">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => handleDispatch(trip._id)}>
                    <Send className="w-4 h-4 mr-2" /> Dispatch Now
                  </Button>
                </div>
              )}

              {trip.status === 'Dispatched' && (role === 'Driver' || role === 'FleetManager') && (
                <div className="pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCompleteData({ ...completeData, id: trip._id })}>
                        Complete Trip
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>Complete Trip</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleComplete} className="space-y-4 pt-4">
                        <div className="space-y-2 text-sm">
                          <label>End Odometer</label>
                          <Input value={completeData.endOdometer} onChange={(e) => setCompleteData({...completeData, endOdometer: e.target.value})} type="number" required />
                        </div>
                        <div className="space-y-2 text-sm">
                          <label>Fuel Consumed (Liters)</label>
                          <Input value={completeData.fuelConsumed} onChange={(e) => setCompleteData({...completeData, fuelConsumed: e.target.value})} type="number" required />
                        </div>
                        <div className="space-y-2 text-sm">
                          <label>Revenue ($)</label>
                          <Input value={completeData.revenue} onChange={(e) => setCompleteData({...completeData, revenue: e.target.value})} type="number" required />
                        </div>
                        <Button type="submit" className="w-full">Mark as Completed</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
