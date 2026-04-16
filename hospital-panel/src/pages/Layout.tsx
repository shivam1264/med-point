import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/beds', icon: '🛏️', label: 'Bed Management' },
  { path: '/doctors', icon: '👨‍⚕️', label: 'Doctors' },
  { path: '/ambulances', icon: '🚑', label: 'Ambulances' },
  { path: '/emergencies', icon: '🆘', label: 'Emergencies' },
];

export default function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-emoji">🏥</span>
          <div>
            <div className="brand-name">MedFlow</div>
            <div className="brand-sub">{admin?.hospitalName || 'Admin Panel'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-name">{admin?.name}</div>
            <div className="admin-email">{admin?.email}</div>
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
