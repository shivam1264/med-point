import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import BedManagement from './pages/BedManagement';
import Doctors from './pages/Doctors';
import Ambulances from './pages/Ambulances';
import Emergencies from './pages/Emergencies';

// A wrapper that checks for auth then renders the Layout (which has the Outlet)
function ProtectedShell() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0D0D0D', color: '#C0392B', fontSize: '18px' }}>
        Loading MedFlow...
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginRedirect />} />

          {/* Protected Routes nested under Layout */}
          <Route element={<ProtectedShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="beds" element={<BedManagement />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="ambulances" element={<Ambulances />} />
            <Route path="emergencies" element={<Emergencies />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginRedirect() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

