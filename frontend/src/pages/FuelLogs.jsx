import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Droplet, Plus, Trash2, Fuel, TrendingUp } from 'lucide-react';
import { getFuelLogs, createFuelLog, deleteFuelLog, getVehicles, getTrips } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export function FuelLogs() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const { role } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuelResult, vehiclesResult, tripsResult] = await Promise.allSettled([
        getFuelLogs(),
        getVehicles(),
        getTrips()
      ]);

      const extractArray = (res) => {
        if (!res || res.status === 'rejected') return [];
        const val = res.value;
        return Array.isArray(val?.data?.data) ? val.data.data : (Array.isArray(val?.data) ? val.data : []);
      };
      
      setFuelLogs(extractArray(fuelResult));
      setVehicles(extractArray(vehiclesResult));
      setTrips(extractArray(tripsResult));
      
      if (fuelResult.status === 'rejected') {
         console.error('Fuel API failed:', fuelResult.reason);
         toast({ title: 'Warning', description: 'Failed to fetch fuel logs. Backend might be down.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch fuel data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newFuelLog = {
      vehicle: formData.get('vehicle'),
      trip: formData.get('trip') || null,
      liters: Number(formData.get('liters')),
      cost: Number(formData.get('cost')),
      date: formData.get('date'),
    };
    
    try {
      await createFuelLog(newFuelLog);
      toast({ title: 'Success', description: 'Fuel log added successfully' });
      setIsCreateOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add fuel log', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFuelLog(id);
      toast({ title: 'Deleted', description: 'Fuel log removed' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete fuel log', variant: 'destructive' });
    }
  };

  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + (log.cost || 0), 0);
  const totalLiters = fuelLogs.reduce((acc, log) => acc + (log.liters || 0), 0);
  const avgCostPerLiter = totalLiters > 0 ? (totalFuelCost / totalLiters).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Droplet className="w-8 h-8 text-cyan-500" />
            Fuel Management
          </h1>
          <p className="text-muted-foreground mt-1">Track fleet refueling operations and fuel expenses.</p>
        </div>
        
        {(role === 'FleetManager' || role === 'Driver') && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20">
                <Plus className="w-4 h-4" /> Log Fuel Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Log Fuel Purchase</DialogTitle>
                <DialogDescription>Enter details of the refueling event.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle</label>
                  <select name="vehicle" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Associated Trip (Optional)</label>
                  <select name="trip" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">None</option>
                    {trips.map(t => (
                      <option key={t._id} value={t._id}>Trip #{t._id.slice(-6).toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Liters</label>
                    <Input name="liters" type="number" step="0.1" placeholder="e.g. 50" required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Cost ($)</label>
                    <Input name="cost" type="number" step="0.01" placeholder="e.g. 150.00" required className="bg-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input name="date" type="date" required className="bg-background" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Save Fuel Log</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Fuel Expense</CardTitle>
              <Fuel className="w-4 h-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFuelCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Liters Pumped</CardTitle>
              <Droplet className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLiters.toLocaleString()} L</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost Per Liter</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgCostPerLiter}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader className="py-4 flex flex-row justify-between items-center border-b border-border">
          <CardTitle className="text-lg">Fuel Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-6 py-3 font-medium">Trip Ref</th>
                  <th className="px-6 py-3 font-medium">Liters</th>
                  <th className="px-6 py-3 font-medium">Cost</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-16"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-secondary rounded w-8 ml-auto"></div></td>
                    </tr>
                  ))
                ) : fuelLogs.length > 0 ? (
                  fuelLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">{new Date(log.date || log.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">{log.vehicle?.registrationNumber || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        {log.trip ? `Trip #${(log.trip._id || log.trip).toString().slice(-6).toUpperCase()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-blue-500 font-medium">{log.liters} L</td>
                      <td className="px-6 py-4 font-bold text-foreground">${log.cost?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right">
                        {(role === 'FleetManager' || role === 'Driver') && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(log._id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">No fuel logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
