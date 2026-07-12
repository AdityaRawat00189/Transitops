import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CircleDollarSign } from 'lucide-react';
import { getTrips, getMaintenanceLogs } from '@/api/services';

export function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripsRes, maintenanceRes] = await Promise.all([
          getTrips(),
          getMaintenanceLogs()
        ]);
        
        const trips = tripsRes.data?.data || [];
        const maintenance = maintenanceRes.data?.data || [];
        
        let allExpenses = [];
        let total = 0;

        // Process Trip Fuel Costs
        trips.forEach(trip => {
          if (trip.status === 'Completed' && trip.fuelConsumed) {
            // Estimate fuel cost at $3.50 per liter
            const cost = trip.fuelConsumed * 3.5;
            total += cost;
            allExpenses.push({
              id: `T-${trip._id.slice(-6).toUpperCase()}`,
              category: 'Fuel',
              amount: cost,
              date: new Date(trip.updatedAt).toLocaleDateString(),
              description: `Fuel for Trip ${trip.source} to ${trip.destination}`
            });
          }
        });

        // Process Maintenance Costs
        maintenance.forEach(log => {
          if (log.cost) {
            total += log.cost;
            allExpenses.push({
              id: `M-${log._id.slice(-6).toUpperCase()}`,
              category: 'Maintenance',
              amount: log.cost,
              date: new Date(log.createdAt).toLocaleDateString(),
              description: log.description || log.maintenanceType
            });
          }
        });

        // Sort by newest
        allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setExpenses(allExpenses);
        setTotalCost(total);
      } catch (error) {
        console.error("Failed to load expenses data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Expenses</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Operational Cost (All Time)</CardTitle>
            <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1 text-cyan-500">Aggregated from Trips and Maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-lg">Expense Ledger</CardTitle>
          <CardDescription>Generated automatically from completed trips and maintenance records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Expense ID</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted-foreground">Loading...</td></tr>
                ) : expenses.length > 0 ? expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{expense.id}</td>
                    <td className="px-6 py-4">{expense.date}</td>
                    <td className="px-6 py-4">{expense.category}</td>
                    <td className="px-6 py-4 truncate max-w-sm" title={expense.description}>{expense.description}</td>
                    <td className="px-6 py-4">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center py-4 text-muted-foreground">No expenses recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
