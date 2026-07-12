import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Send, Wrench, CircleDollarSign, LogOut, Droplet, Menu, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

export function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Exact RBAC mappings based on backend string values
  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['FleetManager', 'SafetyOfficer', 'FinancialAnalyst'] },
    { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['FleetManager', 'SafetyOfficer'] },
    { name: 'Drivers', path: '/drivers', icon: Users, roles: ['FleetManager', 'SafetyOfficer'] },
    { name: 'Dispatch', path: '/dispatch', icon: Send, roles: ['FleetManager', 'Driver'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['FleetManager'] },
    { name: 'Fuel Logs', path: '/fuel', icon: Droplet, roles: ['FleetManager', 'Driver', 'FinancialAnalyst'] },
    { name: 'Expenses', path: '/expenses', icon: CircleDollarSign, roles: ['FleetManager', 'FinancialAnalyst'] },
    { name: 'Analytics', path: '/analytics', icon: LayoutDashboard, roles: ['FleetManager', 'FinancialAnalyst'] },
  ];

  const visibleLinks = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const pageTitle = NAV_ITEMS.find(item => item.path === location.pathname)?.name || 'Fleet Command';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-r border-white/5 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative z-10">
        <span className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Truck className="h-5 w-5 text-emerald-400" />
          </div>
          TransitOps
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2 relative z-10 custom-scrollbar">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-2 mt-2">
          Navigation
        </div>
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={
                cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                )
              }
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-0 w-1 h-full bg-emerald-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white")} />
              {link.name}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 relative z-10 bg-black/20">
        <div className="px-3 mb-4 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-emerald-400 font-medium mt-0.5">{role}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors border border-transparent hover:border-rose-500/20 group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Secure Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 z-20 h-full p-4 pl-4 py-4">
        <div className="h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
           <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full z-10 relative">
        {/* Top Navigation Bar */}
        <header className="h-20 px-6 lg:px-10 flex items-center justify-between border-b border-white/5 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{pageTitle}</h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 hover:border-white/10 hover:shadow-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.8)]"></span>
             </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

