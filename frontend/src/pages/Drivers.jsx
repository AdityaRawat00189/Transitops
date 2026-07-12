import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, UserCircle2, Phone, FileText, CalendarClock } from 'lucide-react';
import { getDrivers, createDriver } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { role } = useAuth();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await getDrivers();
      setDrivers(res.data?.data || res.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch drivers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' };
      case 'OnTrip': return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' };
      case 'Suspended': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' };
      case 'OffDuty': return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' };
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newDriver = {
      name: formData.get('name'),
      contactNumber: formData.get('contactNumber'),
      licenseNumber: formData.get('licenseNumber'),
      licenseExpiry: formData.get('licenseExpiry'),
      status: 'Available',
    };
    
    try {
      await createDriver(newDriver);
      toast({ title: 'Success', description: 'Driver added to roster successfully' });
      setIsCreateOpen(false);
      fetchDrivers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add driver', variant: 'destructive' });
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
               <UserCircle2 className="w-6 h-6 text-indigo-400" />
             </div>
             Driver Roster
          </h1>
          <p className="text-slate-400 mt-2">Manage personnel, licenses, and duty status.</p>
        </motion.div>
        
        <motion.div variants={item} className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 transition-colors"
            />
          </div>
          {role === 'FleetManager' && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-950 text-white border-white/10 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Register New Driver</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                    <Input name="name" placeholder="e.g. John Doe" required className="bg-slate-900/50 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Contact Number</label>
                    <Input name="contactNumber" type="text" placeholder="+1 234 567 8900" required className="bg-slate-900/50 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">License Number</label>
                    <Input name="licenseNumber" type="text" placeholder="DL-123456789" required className="bg-slate-900/50 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">License Expiry Date</label>
                    <Input name="licenseExpiry" type="date" required className="bg-slate-900/50 border-white/10 text-white dark:[color-scheme:dark]" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white">Create Driver</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-48 bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
           ))}
        </div>
      ) : filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDrivers.map((driver) => {
              const statusStyle = getStatusStyle(driver.status);
              const isExpiringSoon = new Date(driver.licenseExpiry) < new Date(new Date().setMonth(new Date().getMonth() + 1));
              return (
                <motion.div key={driver._id} variants={item} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Card className="glass-card group h-full flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white font-bold">{driver.name}</CardTitle>
                            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5" /> {driver.contactNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 flex-1">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                           <div className="flex items-center gap-2 text-sm text-slate-300">
                             <FileText className="w-4 h-4 text-slate-400" />
                             {driver.licenseNumber}
                           </div>
                           <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1.5`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                             {driver.status}
                           </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 mt-4 border-t border-white/5 bg-black/10 rounded-b-xl flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <CalendarClock className={`w-4 h-4 ${isExpiringSoon ? 'text-amber-500' : 'text-slate-500'}`} />
                         <span className={`text-xs font-medium ${isExpiringSoon ? 'text-amber-500' : 'text-slate-400'}`}>
                           Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                         </span>
                       </div>
                       <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                         View Details
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
            <UserCircle2 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No personnel found</h3>
          <p className="text-slate-400 max-w-sm">
            {searchQuery ? `No drivers match your search "${searchQuery}".` : "Your roster is empty. Add personnel to get started."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
