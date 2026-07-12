import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { getVehicles, createVehicle } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20';
      case 'OnTrip': return 'bg-cyan-500/15 text-cyan-500 hover:bg-cyan-500/25 border-cyan-500/20';
      case 'InShop': return 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20';
      case 'Retired': return 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border-rose-500/20';
      default: return 'bg-secondary text-secondary-foreground';
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
      toast({ title: 'Success', description: 'Vehicle added successfully' });
      setIsCreateOpen(false);
      fetchVehicles();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add vehicle', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Vehicles</h1>
        
        {role === 'FleetManager' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Number</label>
                  <Input name="registrationNumber" type="text" placeholder="e.g. MH-12-AB-1234" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Name</label>
                  <Input name="vehicleName" type="text" placeholder="e.g. Alpha Truck" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Input name="model" type="text" placeholder="e.g. Volvo VNL" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <select name="vehicleType" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity (Tons)</label>
                  <Input name="maxLoadCapacity" type="number" placeholder="e.g. 20" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Acquisition Cost</label>
                  <Input name="acquisitionCost" type="number" placeholder="e.g. 150000" required className="bg-background" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">Create Vehicle</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="py-4 flex flex-row justify-between items-center border-b border-border">
          <CardTitle className="text-lg">Vehicle Registry</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search vehicles..."
              className="pl-8 bg-background border-input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Reg Number</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Capacity</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted-foreground">Loading...</td></tr>
                ) : vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{vehicle.registrationNumber}</td>
                    <td className="px-6 py-4">{vehicle.vehicleName}</td>
                    <td className="px-6 py-4">{vehicle.vehicleType}</td>
                    <td className="px-6 py-4">{vehicle.maxLoadCapacity} Tons</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getStatusColor(vehicle.status)}>
                        {vehicle.status}
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
