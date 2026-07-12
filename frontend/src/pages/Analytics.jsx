import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';

export function Analytics() {
  const fuelData = [
    { month: 'Jan', efficiency: 6.5 },
    { month: 'Feb', efficiency: 6.8 },
    { month: 'Mar', efficiency: 7.2 },
    { month: 'Apr', efficiency: 7.1 },
    { month: 'May', efficiency: 7.5 },
    { month: 'Jun', efficiency: 7.8 },
  ];

  const costData = [
    { month: 'Jan', fuel: 4000, maintenance: 2400 },
    { month: 'Feb', fuel: 3800, maintenance: 1398 },
    { month: 'Mar', fuel: 4200, maintenance: 9800 },
    { month: 'Apr', fuel: 3900, maintenance: 3908 },
    { month: 'May', fuel: 4100, maintenance: 4800 },
    { month: 'Jun', fuel: 3800, maintenance: 3800 },
  ];

  const roiData = [
    { id: 'V-101', revenue: 45000, cost: 12000, roi: '275%' },
    { id: 'V-103', revenue: 38000, cost: 9500, roi: '300%' },
    { id: 'V-104', revenue: 22000, cost: 8000, roi: '175%' },
    { id: 'V-102', revenue: 15000, cost: 18000, roi: '-16%' },
  ];

  const handleExport = () => {
    // Mock export function
    alert("Exporting ROI data to CSV...");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reporting</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Fleet Fuel Efficiency (MPG)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operational Cost Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Operational Costs</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Vehicle ROI Leaderboard */}
      <Card className="bg-card border-border">
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
                {roiData.map((data) => {
                  const isNegative = data.roi.startsWith('-');
                  return (
                    <tr key={data.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{data.id}</td>
                      <td className="px-6 py-4">${data.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4">${data.cost.toLocaleString()}</td>
                      <td className={`px-6 py-4 font-bold ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {data.roi}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
