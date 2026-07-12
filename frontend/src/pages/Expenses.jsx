import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, TrendingDown } from 'lucide-react';

export function Expenses() {
  const expenses = [
    { id: 'E-001', category: 'Fuel', amount: 450, date: '2026-07-11', description: 'V-101 Refuel' },
    { id: 'E-002', category: 'Maintenance', amount: 1200, date: '2026-07-10', description: 'V-102 Engine Repair' },
    { id: 'E-003', category: 'Tolls', amount: 45, date: '2026-07-09', description: 'Trip T-45 Route Tolls' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Expenses</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (This Month)</CardTitle>
            <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500">-4%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-lg">Expense Ledger</CardTitle>
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
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{expense.id}</td>
                    <td className="px-6 py-4">{expense.date}</td>
                    <td className="px-6 py-4">{expense.category}</td>
                    <td className="px-6 py-4">{expense.description}</td>
                    <td className="px-6 py-4">${expense.amount.toFixed(2)}</td>
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
