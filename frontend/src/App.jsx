import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Vehicles } from '@/pages/Vehicles';
import { Drivers } from '@/pages/Drivers';
import { Dispatch } from '@/pages/Dispatch';
import { Maintenance } from '@/pages/Maintenance';
import { Expenses } from '@/pages/Expenses';
import { Analytics } from '@/pages/Analytics';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/PageTransition';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/vehicles" element={<PageTransition><Vehicles /></PageTransition>} />
            <Route path="/drivers" element={<PageTransition><Drivers /></PageTransition>} />
            <Route path="/dispatch" element={<PageTransition><Dispatch /></PageTransition>} />
            <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
            <Route path="/expenses" element={<PageTransition><Expenses /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <Router>
        <AnimatedRoutes />
      </Router>
      <Toaster />
    </>
  );
}

export default App;