import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Truck } from 'lucide-react';

export function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        navigate('/dashboard');
      } else {
        toast({ title: "Login Failed", description: res.message, variant: "destructive" });
      }
    } else {
      const name = formData.get('name');
      const role = formData.get('role');
      const res = await register(name, email, password, role);
      if (res.success) {
        toast({ title: "Account Created", description: "Successfully registered and logged in." });
        navigate('/dashboard');
      } else {
        toast({ title: "Registration Failed", description: res.message, variant: "destructive" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="space-y-1 items-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-6 h-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">TransitOps</CardTitle>
          <CardDescription>
            {isLogin ? "Enter your credentials to access your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="name" type="text" placeholder="John Doe" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select name="role" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                    <option value="FleetManager">Fleet Manager</option>
                    <option value="Driver">Driver</option>
                    <option value="SafetyOfficer">Safety Officer</option>
                    <option value="FinancialAnalyst">Financial Analyst</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="john@example.com" required className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" required className="bg-background" />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
