import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Activity, Wrench, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const kpis = [
    { title: "Active Vehicles", value: "45", icon: Truck, trend: "+12%" },
    { title: "Available Vehicles", value: "18", icon: CheckCircle2, trend: "-2%" },
    { title: "In Maintenance", value: "5", icon: Wrench, trend: "+1%" },
    { title: "Active Trips", value: "32", icon: Activity, trend: "+8%" },
    { title: "Fleet Utilization", value: "85%", icon: TrendingUp, trend: "+5%" },
  ];

  const alerts = [
    { id: 1, message: "Driver John Doe license expires in 5 days.", severity: "high", time: "2 hours ago" },
    { id: 2, message: "Vehicle V-102 due for scheduled maintenance.", severity: "medium", time: "5 hours ago" },
    { id: 3, message: "Trip T-45 delayed due to weather.", severity: "medium", time: "1 day ago" },
  ];

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
          <select className="bg-card text-card-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Regions</option>
            <option>North</option>
            <option>South</option>
          </select>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}>
                    {kpi.trend}
                  </span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Alerts Feed */}
      <Card className="col-span-3 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="capitalize">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
