import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Truck, Calendar, Activity, MapPin } from 'lucide-react';
import { getVehicles, createVehicle } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { role } = useAuth();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles();
      setVehicles(res.data?.data || res.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch vehicles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' };
      case 'OnTrip': return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' };
      case 'InShop': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' };
      case 'Retired': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' };
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newVehicle = {
      registrationNumber: formData.get('registrationNumber'),
      vehicleName: formData.get('vehicleName'),
      model: formData.get('model'),
      vehicleType: formData.get('vehicleType'),
      maxLoadCapacity: Number(formData.get('maxLoadCapacity')),
      acquisitionCost: Number(formData.get('acquisitionCost')),
      status: 'Available',
    };
    
    try {
      await createVehicle(newVehicle);
      toast({ title: 'Success', description: 'Vehicle deployed to fleet successfully' });
      setIsCreateOpen(false);
      fetchVehicles();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add vehicle', variant: 'destructive' });
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
               <Truck className="w-6 h-6 text-emerald-400" />
             </div>
             Fleet Assets
          </h1>
          <p className="text-slate-400 mt-2">Manage and monitor all your transport vehicles.</p>
        </motion.div>
        
        <motion.div variants={item} className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/50 border-white/10 text-white focus:border-emerald-500/50 transition-colors"
            />
          </div>
          {role === 'FleetManager' && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Deploy Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-950 text-white border-white/10 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Register New Asset</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Registration Number</label>
                    <Input name="registrationNumber" type="text" placeholder="e.g. MH-12-AB-1234" required className="bg-slate-900/50 border-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Name</label>
                      <Input name="vehicleName" type="text" placeholder="e.g. Alpha Truck" required className="bg-slate-900/50 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Model</label>
                      <Input name="model" type="text" placeholder="e.g. Volvo VNL" required className="bg-slate-900/50 border-white/10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Type</label>
                      <select name="vehicleType" className="w-full bg-slate-900/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 text-white" required>
                        <option value="Truck" className="bg-slate-900">Truck</option>
                        <option value="Van" className="bg-slate-900">Van</option>
                        <option value="Car" className="bg-slate-900">Car</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Capacity (Tons)</label>
                      <Input name="maxLoadCapacity" type="number" placeholder="e.g. 20" required className="bg-slate-900/50 border-white/10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Acquisition Cost ($)</label>
                    <Input name="acquisitionCost" type="number" placeholder="e.g. 150000" required className="bg-slate-900/50 border-white/10" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">Create Asset</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="h-64 bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
           ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredVehicles.map((vehicle) => {
              const statusStyle = getStatusStyle(vehicle.status);
              return (
                <motion.div key={vehicle._id} variants={item} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Card className="glass-card group h-full flex flex-col">
                    <CardHeader className="pb-3 border-b border-white/5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-xl text-white font-bold">{vehicle.registrationNumber}</CardTitle>
                          <p className="text-sm text-slate-400 font-medium">{vehicle.vehicleName} • {vehicle.model}</p>
                        </div>
                        <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1.5 py-1 px-2.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Type</p>
                          <p className="text-sm text-slate-300 flex items-center gap-1.5">
                             <Truck className="w-3.5 h-3.5 text-slate-400" /> {vehicle.vehicleType}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Capacity</p>
                          <p className="text-sm text-slate-300 flex items-center gap-1.5">
                             <Activity className="w-3.5 h-3.5 text-slate-400" /> {vehicle.maxLoadCapacity} Tons
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 pb-4 border-t border-white/5 bg-black/10 flex justify-between items-center rounded-b-xl">
                       <span className="text-xs text-slate-500">Added: {new Date(vehicle.createdAt).toLocaleDateString()}</span>
                       <Button variant="ghost" size="sm" className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                         View Logs
                       </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div variants={item} className="glass-panel p-12 flex flex-col items-center justify-center text-center rounded-2xl border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
          <p className="text-slate-400 max-w-sm">
            {searchQuery ? `No assets match your search "${searchQuery}".` : "Your fleet is currently empty. Add your first vehicle to get started."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
