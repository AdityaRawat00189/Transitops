import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wrench, CheckCircle } from 'lucide-react';
import { getVehicles, getMaintenanceLogs, logMaintenance, closeMaintenance } from '@/api/services';

export function Maintenance() {
  const { toast } = useToast();
  
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesResult, logsResult] = await Promise.allSettled([
        getVehicles(),
        getMaintenanceLogs()
      ]);

      const extractArray = (res) => {
        if (!res || res.status === 'rejected') return [];
        const val = res.value;
        return Array.isArray(val?.data?.data) ? val.data.data : (Array.isArray(val?.data) ? val.data : []);
      };

      setVehicles(extractArray(vehiclesResult));
      setLogs(extractArray(logsResult));

      if (logsResult.status === 'rejected') {
        toast({ title: 'Warning', description: 'Failed to fetch maintenance logs.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch maintenance data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const maintenanceData = {
      vehicle: formData.get('vehicle'),
      maintenanceType: formData.get('maintenanceType'),
      description: formData.get('description'),
      cost: Number(formData.get('cost')),
    };
    
    try {
      await logMaintenance(maintenanceData);
      toast({ title: "Scheduled", description: "Maintenance has been scheduled successfully." });
      e.target.reset();
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to schedule", variant: "destructive" });
    }
  };

  const handleCloseMaintenance = async (logId) => {
    try {
      await closeMaintenance(logId);
      toast({ title: "Completed", description: "Maintenance marked as completed." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to close", variant: "destructive" });
    }
  };

  // Only show vehicles that are not retired or already in shop for the dropdown
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance & Service</h1>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border bg-secondary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="w-5 h-5 text-amber-500" /> Schedule Maintenance
          </CardTitle>
          <CardDescription>Move a vehicle from the active fleet into the repair shop.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleScheduleMaintenance} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Vehicle</label>
                <select name="vehicle" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                  <option value="">Choose Available Vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} ({v.model})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Type</label>
                <select name="maintenanceType" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Routine Service">Routine Service</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="e.g. Oil change and brake pads" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Cost ($)</label>
                <Input name="cost" type="number" placeholder="1200" required className="bg-background" />
              </div>
            </div>
            
            <Button type="submit" variant="outline" className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white">
              Confirm Schedule
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-lg">Maintenance Logs</CardTitle>
          <CardDescription>Track active and completed repairs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Cost</th>
                  <th className="px-6 py-3 font-medium">Status</th>
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
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-secondary rounded-full w-20"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-secondary rounded w-24 ml-auto"></div></td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                  <tr key={log._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">{new Date(log.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{log.vehicle?.registrationNumber || 'Unknown'}</td>
                    <td className="px-6 py-4">{log.maintenanceType}</td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={log.description}>{log.description}</td>
                    <td className="px-6 py-4 font-bold text-foreground">${log.cost}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={log.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/15 text-amber-500 border-amber-500/20'}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Open' && (
                        <Button variant="outline" size="sm" onClick={() => handleCloseMaintenance(log._id)} className="text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/50">
                          <CheckCircle className="w-4 h-4 mr-1" /> Mark Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-8 text-muted-foreground">No maintenance logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
