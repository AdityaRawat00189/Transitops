import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Droplet, Search } from 'lucide-react';

export function Maintenance() {
  const { toast } = useToast();
  
  const [vehicles, setVehicles] = useState([
    { id: 'V-101', type: 'Heavy Truck', lastMaintenance: '2025-06-10', status: 'Available' },
    { id: 'V-103', type: 'Heavy Truck', lastMaintenance: '2025-01-15', status: 'Available' },
    { id: 'V-104', type: 'Van', lastMaintenance: '2025-04-22', status: 'Available' },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, vehicleId: 'V-102', type: 'Repair', date: '2026-07-10', cost: 1200, status: 'In Shop' },
    { id: 2, vehicleId: 'V-101', type: 'Fuel', date: '2026-07-11', cost: 450, status: 'Completed' },
  ]);

  const handleMoveToInShop = (vehicleId) => {
    setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, status: 'In Shop' } : v));
    toast({
      title: "Vehicle Status Updated",
      description: `${vehicleId} has been moved to "In Shop" and removed from the dispatch pool.`,
      variant: "destructive",
    });
  };

  const handleLog = (e, type) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newLog = {
      id: Date.now(),
      vehicleId: formData.get('vehicleId'),
      type: type,
      date: new Date().toISOString().split('T')[0],
      cost: Number(formData.get('cost')),
      status: type === 'Repair' ? 'Pending' : 'Completed'
    };
    setLogs([newLog, ...logs]);
    e.target.reset();
    toast({
      title: "Log Recorded",
      description: `${type} log for ${newLog.vehicleId} has been successfully recorded.`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance & Service</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Log Form */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border bg-secondary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplet className="w-5 h-5 text-cyan-500" /> Log Fuel Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={(e) => handleLog(e, 'Fuel')} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle ID</label>
                <Input name="vehicleId" placeholder="e.g. V-101" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost ($)</label>
                <Input name="cost" type="number" placeholder="450" required className="bg-background" />
              </div>
              <Button type="submit" className="w-full">Log Fuel</Button>
            </form>
          </CardContent>
        </Card>

        {/* Maintenance Log Form */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border bg-secondary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-amber-500" /> Schedule Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={(e) => handleLog(e, 'Repair')} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle ID</label>
                <Input name="vehicleId" placeholder="e.g. V-103" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Cost ($)</label>
                <Input name="cost" type="number" placeholder="1200" required className="bg-background" />
              </div>
              <Button type="submit" className="w-full" variant="outline">Schedule Service</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Vehicles List */}
      <Card className="bg-card border-border">
        <CardHeader className="py-4 flex flex-row justify-between items-center border-b border-border">
          <CardTitle className="text-lg">Active Fleet Maintenance Control</CardTitle>
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
                  <th className="px-6 py-3 font-medium">Vehicle ID</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Last Maintenance</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{v.id}</td>
                    <td className="px-6 py-4">{v.type}</td>
                    <td className="px-6 py-4">{v.lastMaintenance}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={v.status === 'Available' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/15 text-amber-500 border-amber-500/20'}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {v.status === 'Available' && (
                        <Button variant="destructive" size="sm" onClick={() => handleMoveToInShop(v.id)}>
                          Move to In Shop
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-card border-border">
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-lg">Recent Service & Fuel Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Vehicle ID</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Cost</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">{log.date}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{log.vehicleId}</td>
                    <td className="px-6 py-4">{log.type}</td>
                    <td className="px-6 py-4">${log.cost}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={log.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/15 text-amber-500 border-amber-500/20'}>
                        {log.status}
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
