import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Send, Wrench, CircleDollarSign, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Exact RBAC mappings based on backend string values
  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['FleetManager', 'SafetyOfficer', 'FinancialAnalyst'] },
    { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['FleetManager', 'SafetyOfficer'] },
    { name: 'Drivers', path: '/drivers', icon: Users, roles: ['FleetManager', 'SafetyOfficer'] },
    { name: 'Dispatch/Trips', path: '/dispatch', icon: Send, roles: ['FleetManager', 'Driver'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['FleetManager'] },
    { name: 'Expenses', path: '/expenses', icon: CircleDollarSign, roles: ['FleetManager', 'FinancialAnalyst'] },
    { name: 'Analytics', path: '/analytics', icon: LayoutDashboard, roles: ['FleetManager', 'FinancialAnalyst'] },
  ];

  const visibleLinks = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-card border-r border-border h-full flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="text-lg font-bold text-primary flex items-center gap-2">
              <Truck className="h-6 w-6 text-emerald-500" />
              TransitOps
            </span>
          </div>

          <div className="p-4 overflow-y-auto space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
              Menu
            </div>
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="px-2 mb-4">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}

