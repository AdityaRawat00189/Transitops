import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CircleDollarSign, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getMaintenanceLogs, getFuelLogs, getExpenses, createExpense, deleteExpense, getVehicles } from '@/api/services';

export function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [maintenanceResult, fuelResult, expensesResult, vehiclesResult] = await Promise.allSettled([
        getMaintenanceLogs(),
        getFuelLogs(),
        getExpenses(),
        getVehicles()
      ]);
      
      const extractArray = (res) => {
        if (!res || res.status === 'rejected') return [];
        const val = res.value;
        return Array.isArray(val?.data?.data) ? val.data.data : (Array.isArray(val?.data) ? val.data : []);
      };

      const maintenance = extractArray(maintenanceResult);
      const fuel = extractArray(fuelResult);
      const manualExpenses = extractArray(expensesResult);
      const vehiclesList = extractArray(vehiclesResult);
      
      setVehicles(vehiclesList);
      
      let allExpenses = [];
      let total = 0;

      // Process actual Fuel Logs
      fuel.forEach(log => {
        if (log.cost) {
          total += log.cost;
          allExpenses.push({
            id: `F-${log._id.slice(-6).toUpperCase()}`,
            rawId: log._id,
            category: 'Fuel',
            amount: log.cost,
            date: new Date(log.date || log.createdAt).toLocaleDateString(),
            description: `Refueling ${log.vehicle?.registrationNumber || 'Vehicle'} - ${log.liters}L`,
            canDelete: false
          });
        }
      });

      // Process Maintenance Costs
      maintenance.forEach(log => {
        if (log.cost) {
          total += log.cost;
          allExpenses.push({
            id: `M-${log._id.slice(-6).toUpperCase()}`,
            rawId: log._id,
            category: 'Maintenance',
            amount: log.cost,
            date: new Date(log.createdAt).toLocaleDateString(),
            description: log.description || log.maintenanceType,
            canDelete: false
          });
        }
      });

      // Process Manual Expenses
      manualExpenses.forEach(exp => {
        if (exp.amount) {
          total += exp.amount;
          allExpenses.push({
            id: `E-${exp._id.slice(-6).toUpperCase()}`,
            rawId: exp._id,
            category: exp.expenseType,
            amount: exp.amount,
            date: new Date(exp.date || exp.createdAt).toLocaleDateString(),
            description: exp.description || `Vehicle ${exp.vehicle?.registrationNumber || 'N/A'}`,
            canDelete: true
          });
        }
      });

      // Sort by newest
      allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setExpenses(allExpenses);
      setTotalCost(total);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load expenses data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newExpense = {
      vehicle: formData.get('vehicle') || null,
      expenseType: formData.get('expenseType'),
      amount: Number(formData.get('amount')),
      description: formData.get('description'),
      date: formData.get('date'),
    };
    
    try {
      await createExpense(newExpense);
      toast({ title: 'Success', description: 'Expense recorded successfully' });
      setIsCreateOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to record expense', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      toast({ title: 'Deleted', description: 'Expense removed' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete expense', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Fleet Expenses
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive view of all fleet operational costs.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20">
              <Plus className="w-4 h-4" /> Add Manual Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Record Manual Expense</DialogTitle>
              <DialogDescription>Log tolls, parking, insurance, or other operational costs.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Expense Category</label>
                <select name="expenseType" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                  <option value="Toll">Toll</option>
                  <option value="Parking">Parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Repair">Repair</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle (Optional)</label>
                <select name="vehicle" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">None / Fleet-wide</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount ($)</label>
                  <Input name="amount" type="number" step="0.01" placeholder="e.g. 50.00" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input name="date" type="date" required className="bg-background" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="e.g. Highway toll" required className="bg-background" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Save Expense</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Operational Cost (Sum)</CardTitle>
            <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1 text-cyan-500">Aggregated from Fuel, Maintenance, and Manual Logs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-lg">Unified Expense Ledger</CardTitle>
          <CardDescription>Track all money leaving the business.</CardDescription>
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
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-48"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-secondary rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-secondary rounded w-8 ml-auto"></div></td>
                    </tr>
                  ))
                ) : expenses.length > 0 ? expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{expense.id}</td>
                    <td className="px-6 py-4">{expense.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${expense.category === 'Fuel' ? 'bg-cyan-500/10 text-cyan-500' : expense.category === 'Maintenance' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-sm" title={expense.description}>{expense.description}</td>
                    <td className="px-6 py-4 font-bold text-rose-500 text-right">-${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      {expense.canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.rawId)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">No expenses recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
