import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Truck, Activity, Wrench, AlertTriangle, CheckCircle2, Navigation, Map as MapIcon, User, Save, Phone, Hash } from 'lucide-react';
import { getVehicles, getTrips, getDrivers, updateDriver } from '@/api/services';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Driver specific state
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [driverProfile, setDriverProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    licenseNumber: '',
    licenseCategory: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        if (role === 'Driver') {
          // Fetch driver profile
          const driversRes = await getDrivers();
          const driversList = driversRes.data?.data || driversRes.data || [];
          // Find the driver matching the logged-in user
          const myDriver = driversList.find(d => d._id === user?._id || d.name === user?.name);
          if (myDriver) {
            setDriverProfile(myDriver);
            setFormData({
              name: myDriver.name || '',
              contactNumber: myDriver.contactNumber || '',
              licenseNumber: myDriver.licenseNumber || '',
              licenseCategory: myDriver.licenseCategory || ''
            });
          }
        } else {
          // Fetch fleet manager data
          const [vehiclesRes, tripsRes] = await Promise.all([
            getVehicles(),
            getTrips()
          ]);
          setVehicles(vehiclesRes.data || []);
          setTrips(tripsRes.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [role, user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!driverProfile) return;
    
    setIsSaving(true);
    try {
      await updateDriver(driverProfile._id, formData);
      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setDriverProfile({ ...driverProfile, ...formData });
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (role === 'Driver') {
    return (
      <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 max-w-4xl mx-auto">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
               <User className="w-6 h-6 text-emerald-400" />
             </div>
             Driver Portal
          </h1>
          <p className="text-slate-400 mt-2">Manage your profile and personal information.</p>
        </motion.div>

        {loading ? (
           <div className="h-96 bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
        ) : (
          <motion.div variants={item}>
            <Card className="glass-panel overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />
              <CardHeader className="border-b border-white/5 pb-6 bg-slate-900/20">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-slate-400">Ensure your contact and licensing details are up to date.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <User className="w-4 h-4 text-emerald-400" /> Full Name
                      </label>
                      <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="bg-slate-900/50 border-white/10 text-white focus:border-emerald-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Phone className="w-4 h-4 text-cyan-400" /> Contact Number
                      </label>
                      <Input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="+1 (555) 000-0000" className="bg-slate-900/50 border-white/10 text-white focus:border-cyan-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Hash className="w-4 h-4 text-indigo-400" /> License Number
                      </label>
                      <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="DL-XXXX-XXXX" className="bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <User className="w-4 h-4 text-rose-400" /> License Category
                      </label>
                      <Input name="licenseCategory" value={formData.licenseCategory} onChange={handleChange} placeholder="CDL-A" className="bg-slate-900/50 border-white/10 text-white focus:border-rose-500/50" />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="bg-black/20 border-t border-white/5 py-4 px-6 flex justify-end">
                 <Button type="submit" form="profile-form" disabled={isSaving || !driverProfile} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                   {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                   {isSaving ? 'Saving...' : 'Save Profile'}
                 </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // FLEET MANAGER DASHBOARD
  const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance = vehicles.filter(v => v.status === 'InShop').length;
  const activeTripsList = trips.filter(t => t.status === 'Dispatched');
  const activeTripsCount = activeTripsList.length;
  const utilization = totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles - inMaintenance) / totalVehicles) * 100) : 0;

  const kpis = [
    { title: "Fleet Size", value: totalVehicles.toString(), icon: Truck, trend: "Active assets", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { title: "Available", value: availableVehicles.toString(), icon: CheckCircle2, trend: "Ready to deploy", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "In Maintenance", value: inMaintenance.toString(), icon: Wrench, trend: "In repair shop", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "Active Trips", value: activeTripsCount.toString(), icon: Navigation, trend: "On the road", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { title: "Utilization", value: `${utilization}%`, icon: Activity, trend: "Overall capacity", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  ];

  const alerts = [];
  vehicles.filter(v => v.status === 'InShop').forEach(v => {
    alerts.push({ id: `v-${v._id}`, message: `Vehicle ${v.registrationNumber} requires maintenance oversight.`, severity: "medium", time: "Active", type: "maintenance" });
  });
  trips.filter(t => t.status === 'Cancelled').forEach(t => {
    alerts.push({ id: `t-${t._id}`, message: `Trip ${t.source} to ${t.destination} was aborted.`, severity: "high", time: "Recent", type: "trip" });
  });
  if (utilization > 85) {
    alerts.push({ id: `u-high`, message: `High fleet utilization (${utilization}%). Consider rotating assets.`, severity: "medium", time: "System", type: "system" });
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
               <Activity className="w-6 h-6 text-indigo-400" />
             </div>
             Command Center
          </h1>
          <p className="text-slate-400 mt-2">Real-time overview of your fleet operations.</p>
        </motion.div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {loading ? (
           [...Array(5)].map((_, i) => (
             <div key={i} className="h-32 bg-slate-900/40 rounded-xl animate-pulse border border-white/5"></div>
           ))
        ) : kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={index} variants={item}>
              <Card className={`glass-card ${kpi.border}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
                      <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{kpi.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${kpi.bg}`}>
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-1 font-medium">
                    {kpi.trend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trips Live Feed (Expanded to 2 cols to replace map) */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-panel h-full">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Live Dispatch Feed
              </CardTitle>
              <CardDescription className="text-slate-400">Currently active and moving vehicles across the network.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-4">
                {loading ? (
                   <div className="text-center py-10 text-slate-500 animate-pulse">Establishing connection...</div>
                ) : activeTripsCount > 0 ? activeTripsList.slice(0, 6).map(trip => (
                   <div key={trip._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="relative">
                         <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-cyan-400" />
                         </div>
                         <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping"></span>
                         <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full"></span>
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-white">{trip.source} <span className="text-slate-500 mx-1">→</span> {trip.destination}</p>
                         <p className="text-xs text-slate-400 mt-0.5">Vehicle: {trip.vehicle?.registrationNumber || 'Assigned'} • Driver: {trip.driver?.name || 'Assigned'}</p>
                       </div>
                     </div>
                     <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20">
                       In Transit
                     </Badge>
                   </div>
                )) : (
                   <div className="text-center py-16 flex flex-col items-center justify-center">
                     <Navigation className="w-16 h-16 text-slate-700 mb-4 opacity-50" />
                     <p className="text-slate-300 font-semibold text-lg">No active trips</p>
                     <p className="text-sm text-slate-500 mt-1">All vehicles are currently at base or awaiting dispatch.</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority Alerts */}
        <motion.div variants={item}>
          <Card className="glass-panel h-full flex flex-col">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-white/5">
                {loading ? (
                   <div className="text-center py-10 text-slate-500 animate-pulse">Scanning systems...</div>
                ) : alerts.length > 0 ? alerts.slice(0, 6).map((alert, i) => (
                  <div key={i} className="p-5 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                          {alert.time} • {alert.type}
                        </p>
                      </div>
                      <Badge variant="outline" className={alert.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center flex flex-col justify-center items-center h-full">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                    <p className="text-slate-300 text-sm font-semibold">All systems nominal</p>
                    <p className="text-slate-500 text-xs mt-1">No alerts require your attention.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
