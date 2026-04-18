import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import '../styles/pages.css';

interface Stats { hospitals: number; doctors: number; ambulances: number; emergencies: number; }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ hospitals: 0, doctors: 0, ambulances: 0, emergencies: 0 });
  const [recentEmergencies, setRecentEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const [hosp, docs, ambs, emers] = await Promise.all([
        api.get('/hospitals?limit=1'),
        api.get('/doctors'),
        api.get('/ambulances'),
        api.get('/emergencies'),
      ]);
      setStats({
        hospitals: hosp.data.total || hosp.data.count || 0,
        doctors: docs.data.count || 0,
        ambulances: ambs.data.count || 0,
        emergencies: emers.data.count || 0,
      });
      setRecentEmergencies((emers.data.data || []).slice(0, 8));
    } catch (_) {}
    finally { setLoading(false); }
  };

  const statCards = [
    { icon: '🏥', value: stats.hospitals, label: 'Hospitals', color: 'var(--danger)' },
    { icon: '👨‍⚕️', value: stats.doctors, label: 'Doctors', color: 'var(--success)' },
    { icon: '🚑', value: stats.ambulances, label: 'Ambulances', color: 'var(--primary)' },
    { icon: '🆘', value: stats.emergencies, label: 'Total Emergencies', color: 'var(--warning)' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-amber', 
      accepted: 'badge-blue', 
      in_progress: 'badge-blue',
      completed: 'badge-green', 
      cancelled: 'badge-gray'
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="page">
      <header>
        <h1 className="page-title">Healthcare Dashboard</h1>
        <p className="page-sub">Live monitoring system for medical emergencies and resource allocation.</p>
      </header>

      <div className="stats-grid">
        {statCards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ background: c.color + '15', color: c.color }}>{c.icon}</div>
            <div>
              <div className="stat-num">{loading ? '—' : c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="trend-section">
        <h2 className="section-heading">Hourly Emergency Distribution</h2>
        <div className="trend-card">
          <div className="chart-placeholder">
            <svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d="M0,160 L50,130 L100,140 L150,80 L200,110 L250,60 L300,90 L350,40 L400,70 L400,180 L0,180 Z" fill="url(#grad)" />
              <path d="M0,160 L50,130 L100,140 L150,80 L200,110 L250,60 L300,90 L350,40 L400,70" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="chart-labels">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
            </div>
          </div>
          <div className="trend-info">
             <div className="trend-stat"><span>High Volume Peak</span><strong>14:00 - 16:30</strong></div>
             <div className="trend-stat"><span>Response Status</span><strong style={{ color: 'var(--success)' }}>OPTIMAL</strong></div>
          </div>
        </div>
      </div>

      <h2 className="section-heading">Live Incident Stream</h2>
      <div className="table-card">
        {recentEmergencies.length === 0 ? (
          <div className="empty">No active emergencies in the records</div>
        ) : (
          <table>
            <thead>
              <tr><th>Log Time</th><th>Patient Information</th><th>Status</th><th>Ambulance Assigned</th><th>Target Hospital</th></tr>
            </thead>
            <tbody>
              {recentEmergencies.map((e: any) => (
                <tr key={e._id}>
                  <td>{new Date(e.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</td>
                  <td>
                    <strong>{e.user?.name || 'Anonymous Patient'}</strong>
                    <small>{e.user?.phone}</small>
                  </td>
                  <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                  <td>
                    {e.ambulance?.vehicleNumber || 'Pending Dispatch'}<br />
                    {e.userEmergencyContact && <small style={{ color: 'var(--warning)' }}>Contacted: {e.userEmergencyContact}</small>}
                  </td>
                  <td>{e.hospitalName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
