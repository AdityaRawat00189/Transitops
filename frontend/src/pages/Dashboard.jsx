import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Activity, Wrench, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { getVehicles, getTrips } from '@/api/services';

export function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesRes, tripsRes] = await Promise.all([
          getVehicles(),
          getTrips()
        ]);
        setVehicles(vehiclesRes.data || []);
        setTrips(tripsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance = vehicles.filter(v => v.status === 'InShop').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const utilization = totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles - inMaintenance) / totalVehicles) * 100) : 0;

  const kpis = [
    { title: "Active Vehicles", value: totalVehicles.toString(), icon: Truck, trend: "Current" },
    { title: "Available Vehicles", value: availableVehicles.toString(), icon: CheckCircle2, trend: "Ready" },
    { title: "In Maintenance", value: inMaintenance.toString(), icon: Wrench, trend: "In Shop" },
    { title: "Active Trips", value: activeTrips.toString(), icon: Activity, trend: "On Road" },
    { title: "Fleet Utilization", value: `${utilization}%`, icon: TrendingUp, trend: "Active" },
  ];

  // Generate dynamic alerts from trips and vehicles
  const alerts = [];
  vehicles.filter(v => v.status === 'InShop').forEach(v => {
    alerts.push({ id: `v-${v._id}`, message: `Vehicle ${v.registrationNumber} is currently in maintenance.`, severity: "medium", time: "Active" });
  });
  trips.filter(t => t.status === 'Cancelled').forEach(t => {
    alerts.push({ id: `t-${t._id}`, message: `Trip from ${t.source} to ${t.destination} was cancelled.`, severity: "high", time: "Recent" });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
        <div className="flex gap-2">
          {/* Mock Global Filters */}
          <select className="bg-card text-card-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Vehicle Types</option>
            <option>Heavy Truck</option>
            <option>Van</option>
          </select>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {loading ? (
          <div className="col-span-5 py-8 text-center text-muted-foreground">Loading dashboard data...</div>
        ) : kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-cyan-500">{kpi.trend}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Alerts Feed */}
      <Card className="col-span-3 bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="capitalize">
                  {alert.severity}
                </Badge>
              </div>
            )) : (
              <p className="text-muted-foreground text-sm">No active alerts at this time.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
