import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { getTrips, getMaintenanceLogs, getVehicles } from '@/api/services';

export function Analytics() {
  const [costData, setCostData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripsRes, maintenanceRes, vehiclesRes] = await Promise.all([
          getTrips(),
          getMaintenanceLogs(),
          getVehicles()
        ]);

        const trips = tripsRes.data?.data || [];
        const maintenance = maintenanceRes.data?.data || [];
        const vehicles = vehiclesRes.data || [];

        // 1. Process Cost Data by Month
        const monthlyData = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        trips.forEach(trip => {
          if (trip.status === 'Completed' && trip.fuelConsumed) {
            const d = new Date(trip.updatedAt);
            const m = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (!monthlyData[m]) monthlyData[m] = { month: m, fuel: 0, maintenance: 0 };
            monthlyData[m].fuel += (trip.fuelConsumed * 3.5); // Estimate 3.5 per liter
          }
        });

        maintenance.forEach(log => {
          if (log.cost) {
            const d = new Date(log.createdAt);
            const m = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (!monthlyData[m]) monthlyData[m] = { month: m, fuel: 0, maintenance: 0 };
            monthlyData[m].maintenance += log.cost;
          }
        });

        setCostData(Object.values(monthlyData));

        // 2. Process ROI Data by Vehicle
        const vehicleROI = {};
        vehicles.forEach(v => {
          vehicleROI[v._id] = {
            id: v.registrationNumber,
            revenue: 0,
            cost: 0,
            roi: 0
          };
        });

        trips.forEach(trip => {
          if (trip.status === 'Completed' && trip.revenue && trip.vehicle) {
            const vId = trip.vehicle._id || trip.vehicle;
            if (vehicleROI[vId]) {
              vehicleROI[vId].revenue += trip.revenue;
              vehicleROI[vId].cost += (trip.fuelConsumed || 0) * 3.5;
            }
          }
        });

        maintenance.forEach(log => {
          if (log.cost && log.vehicle) {
            const vId = log.vehicle._id || log.vehicle;
            if (vehicleROI[vId]) {
              vehicleROI[vId].cost += log.cost;
            }
          }
        });

        const calculatedROI = Object.values(vehicleROI).map(v => {
          const profit = v.revenue - v.cost;
          const roiPercent = v.cost > 0 ? ((profit / v.cost) * 100).toFixed(0) : 0;
          return {
            ...v,
            roi: `${roiPercent}%`
          };
        }).filter(v => v.revenue > 0 || v.cost > 0);

        calculatedROI.sort((a, b) => parseInt(b.roi) - parseInt(a.roi));
        setRoiData(calculatedROI);

      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = () => {
    // Generate CSV string
    const headers = "Vehicle ID,Total Revenue,Total Cost,ROI %\n";
    const rows = roiData.map(d => `${d.id},${d.revenue},${d.cost},${d.roi}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fleet_roi_report.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reporting</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Cost Chart */}
        <Card className="bg-card border-border shadow-sm col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Operational Costs Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart data...</div>
            ) : costData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="fuel" stackId="a" fill="hsl(var(--chart-2))" name="Fuel ($)" />
                    <Bar dataKey="maintenance" stackId="a" fill="hsl(var(--chart-4))" name="Maintenance ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="h-[300px] flex items-center justify-center text-muted-foreground">Not enough data to plot operational costs.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle ROI Leaderboard */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="py-4 flex flex-row justify-between items-center border-b border-border">
          <CardTitle className="text-lg">Vehicle ROI Leaderboard</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export to CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Vehicle ID</th>
                  <th className="px-6 py-3 font-medium">Total Revenue</th>
                  <th className="px-6 py-3 font-medium">Total Cost</th>
                  <th className="px-6 py-3 font-medium">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   <tr><td colSpan="4" className="text-center py-4 text-muted-foreground">Loading...</td></tr>
                ) : roiData.length > 0 ? roiData.map((data) => {
                  const isNegative = data.roi.startsWith('-');
                  return (
                    <tr key={data.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{data.id}</td>
                      <td className="px-6 py-4">${data.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4">${data.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className={`px-6 py-4 font-bold ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {data.roi}
                      </td>
                    </tr>
                  );
                }) : (
                   <tr><td colSpan="4" className="text-center py-4 text-muted-foreground">No ROI data available yet. Complete some trips!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
