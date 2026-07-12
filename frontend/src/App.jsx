import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Vehicles } from '@/pages/Vehicles';
import { Drivers } from '@/pages/Drivers';
import { Dispatch } from '@/pages/Dispatch';
import { Maintenance } from '@/pages/Maintenance';
import { Expenses } from '@/pages/Expenses';
import { Analytics } from '@/pages/Analytics';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="dispatch" element={<Dispatch />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;