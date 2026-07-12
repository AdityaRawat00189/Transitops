import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Truck, BarChart3, ShieldCheck, Zap, ArrowRight, Activity, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-cyan-500/30 overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-20 pointer-events-none">
        <div className="absolute top-[-100px] left-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
        <div className="absolute top-[50px] right-1/4 w-96 h-96 bg-blue-700 rounded-full mix-blend-screen filter blur-[120px] opacity-70"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TransitOps</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 border-0" onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-cyan-400 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          System v2.0 Now Live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 max-w-4xl"
        >
          The Next Generation of <br className="hidden md:block"/> Fleet Intelligence
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          TransitOps is a unified command center for modern logistics. Track vehicles in real-time, predict maintenance, and optimize dispatch routes with powerful analytics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            size="lg" 
            className="bg-white text-zinc-950 hover:bg-slate-200 h-12 px-8 rounded-full font-semibold group transition-all"
            onClick={() => navigate('/login')}
          >
            Launch Command Center
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:bg-slate-800/40 transition-colors group text-left">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Map className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-3">Smart Dispatch</h3>
            <p className="text-slate-400 leading-relaxed">Assign drivers and vehicles to optimal routes instantly. Full visibility from pickup to dropoff.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:bg-slate-800/40 transition-colors group text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-3">Predictive Maintenance</h3>
            <p className="text-slate-400 leading-relaxed">Prevent breakdowns before they happen. Track service logs and keep your fleet in peak condition.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:bg-slate-800/40 transition-colors group text-left">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-3">ROI Analytics</h3>
            <p className="text-slate-400 leading-relaxed">Calculate exact profitability per vehicle. Deep insights into fuel costs, operational expenses, and revenue.</p>
          </motion.div>
        </motion.div>
      </main>

    </div>
  );
}
