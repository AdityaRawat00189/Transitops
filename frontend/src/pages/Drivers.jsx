import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { getDrivers, createDriver } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20';
      case 'OnTrip': return 'bg-cyan-500/15 text-cyan-500 hover:bg-cyan-500/25 border-cyan-500/20';
      case 'Suspended': return 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border-rose-500/20';
      case 'OffDuty': return 'bg-slate-500/15 text-slate-500 hover:bg-slate-500/25 border-slate-500/20';
      default: return 'bg-secondary text-secondary-foreground';
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
      toast({ title: 'Success', description: 'Driver added successfully' });
      setIsCreateOpen(false);
      fetchDrivers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add driver', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Driver Roster</h1>
        
        {role === 'FleetManager' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="name" placeholder="John Doe" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Number</label>
                  <Input name="contactNumber" type="text" placeholder="+1 234 567 8900" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Number</label>
                  <Input name="licenseNumber" type="text" placeholder="DL-123456789" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Expiry Date</label>
                  <Input name="licenseExpiry" type="date" required className="bg-background" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">Create Driver</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="py-4 flex flex-row justify-between items-center border-b border-border">
          <CardTitle className="text-lg">Personnel Directory</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search drivers..."
              className="pl-8 bg-background border-input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">License</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Expiry</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted-foreground">Loading...</td></tr>
                ) : drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{driver.name}</td>
                    <td className="px-6 py-4">{driver.licenseNumber}</td>
                    <td className="px-6 py-4">{driver.contactNumber}</td>
                    <td className="px-6 py-4">{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getStatusColor(driver.status)}>
                        {driver.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
