import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getTrips, getMaintenanceLogs, getVehicles, getFuelLogs, getExpenses } from '@/api/services';

export function Analytics() {
  const [costData, setCostData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripsResult, maintenanceResult, vehiclesResult, fuelResult, expensesResult] = await Promise.allSettled([
          getTrips(),
          getMaintenanceLogs(),
          getVehicles(),
          getFuelLogs(),
          getExpenses()
        ]);

        const extractArray = (res) => {
          if (!res || res.status === 'rejected') return [];
          const val = res.value;
          return Array.isArray(val?.data?.data) ? val.data.data : (Array.isArray(val?.data) ? val.data : []);
        };

        const trips = extractArray(tripsResult);
        const maintenance = extractArray(maintenanceResult);
        const vehicles = extractArray(vehiclesResult);
        const fuel = extractArray(fuelResult);
        const manualExpenses = extractArray(expensesResult);

        // 1. Process Cost Data by Month
        const monthlyData = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const addToMonth = (dateObj, type, amount) => {
          const d = new Date(dateObj);
          if (isNaN(d.getTime())) return;
          const m = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          if (!monthlyData[m]) monthlyData[m] = { month: m, fuel: 0, maintenance: 0, other: 0 };
          monthlyData[m][type] += amount;
        };

        fuel.forEach(log => {
          if (log.cost) addToMonth(log.date || log.createdAt, 'fuel', log.cost);
        });

        maintenance.forEach(log => {
          if (log.cost) addToMonth(log.createdAt, 'maintenance', log.cost);
        });

        manualExpenses.forEach(exp => {
          if (exp.amount) addToMonth(exp.date || exp.createdAt, 'other', exp.amount);
        });

        setCostData(Object.values(monthlyData));

        // 2. Process ROI Data by Vehicle
        const vehicleROI = {};
        vehicles.forEach(v => {
          vehicleROI[v._id] = {
            id: v.registrationNumber,
            model: v.model,
            revenue: 0,
            cost: 0,
            roi: 0
          };
        });

        trips.forEach(trip => {
          if (trip.status === 'Completed' && trip.revenue && trip.vehicle) {
            const vId = trip.vehicle._id || trip.vehicle;
            if (vehicleROI[vId]) vehicleROI[vId].revenue += trip.revenue;
          }
        });

        fuel.forEach(log => {
          if (log.cost && log.vehicle) {
             const vId = log.vehicle._id || log.vehicle;
             if (vehicleROI[vId]) vehicleROI[vId].cost += log.cost;
          }
        });

        maintenance.forEach(log => {
          if (log.cost && log.vehicle) {
            const vId = log.vehicle._id || log.vehicle;
            if (vehicleROI[vId]) vehicleROI[vId].cost += log.cost;
          }
        });

        manualExpenses.forEach(exp => {
          if (exp.amount && exp.vehicle) {
             const vId = exp.vehicle._id || exp.vehicle;
             if (vehicleROI[vId]) vehicleROI[vId].cost += exp.amount;
          }
        });

        const calculatedROI = Object.values(vehicleROI).map(v => {
          const profit = v.revenue - v.cost;
          const roiPercent = v.cost > 0 ? ((profit / v.cost) * 100).toFixed(0) : (profit > 0 ? 100 : 0);
          return {
            ...v,
            roi: `${roiPercent}%`,
            profit,
            roiVal: Number(roiPercent)
          };
        }).filter(v => v.revenue > 0 || v.cost > 0);

        calculatedROI.sort((a, b) => b.roiVal - a.roiVal);
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
    const headers = "Vehicle,Model,Total Revenue,Total Cost,Net Profit,ROI %\n";
    const rows = roiData.map(d => `${d.id},${d.model},${d.revenue},${d.cost},${d.profit},${d.roi}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fleet_roi_report.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Analytics & Reporting
          </h1>
          <p className="text-muted-foreground mt-1">Data-driven insights to maximize your fleet's profitability.</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Cost Chart */}
        <Card className="bg-card border-border shadow-md col-span-1 lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-secondary/10 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Operational Costs Breakdown
              </CardTitle>
              <CardDescription>Monthly expenses categorized by Fuel, Maintenance, and Manual logs.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
               <div className="h-[350px] flex items-center justify-center animate-pulse bg-secondary/20 rounded-lg"></div>
            ) : costData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                      formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="fuel" stackId="a" fill="hsl(var(--chart-2))" name="Fuel ($)" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="maintenance" stackId="a" fill="hsl(var(--chart-4))" name="Maintenance ($)" />
                    <Bar dataKey="other" stackId="a" fill="hsl(var(--chart-5))" name="Manual Expenses ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                 <Activity className="w-12 h-12 mb-4 text-muted" />
                 <p>Not enough data to plot operational costs.</p>
                 <p className="text-sm">Start logging fuel, maintenance, or manual expenses.</p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle ROI Leaderboard */}
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="py-5 border-b border-border bg-secondary/5">
          <CardTitle className="text-lg">Vehicle ROI Leaderboard</CardTitle>
          <CardDescription>Profitability index ranking your highest and lowest performing assets.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Model</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Revenue</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Cost</th>
                  <th className="px-6 py-4 font-semibold text-right">Net Profit</th>
                  <th className="px-6 py-4 font-semibold text-right">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 bg-secondary rounded w-24"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-secondary rounded w-20"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-secondary rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-secondary rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-secondary rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-secondary rounded w-12 ml-auto"></div></td>
                    </tr>
                  ))
                ) : roiData.length > 0 ? roiData.map((data) => {
                  const isNegativeProfit = data.profit < 0;
                  const isNegativeRoi = data.roiVal < 0;
                  return (
                    <tr key={data.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{data.id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{data.model || 'Unknown'}</td>
                      <td className="px-6 py-4 text-right text-emerald-500 font-medium">${data.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right text-rose-500 font-medium">${data.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isNegativeProfit ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isNegativeProfit ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          ${Math.abs(data.profit).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isNegativeRoi ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-secondary/50">
                          {data.roi}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                   <tr>
                     <td colSpan="6" className="text-center py-12 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-3 text-muted" />
                        No ROI data available yet. Complete some trips and log expenses!
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
