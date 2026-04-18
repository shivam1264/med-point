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
      setRecentEmergencies((emers.data.data || []).slice(0, 6));
    } catch (_) {}
    finally { setLoading(false); }
  };

  const statCards = [
    { icon: '🏥', value: stats.hospitals, label: 'Hospitals', color: '#C0392B' },
    { icon: '👨‍⚕️', value: stats.doctors, label: 'Doctors', color: '#27AE60' },
    { icon: '🚑', value: stats.ambulances, label: 'Ambulances', color: '#378ADD' },
    { icon: '🆘', value: stats.emergencies, label: 'Total Emergencies', color: '#F39C12' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-amber', accepted: 'badge-blue', in_progress: 'badge-blue',
      completed: 'badge-green', cancelled: 'badge-gray'
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Live overview of your healthcare system</p>

      <div className="stats-grid">
        {statCards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ background: c.color + '22', color: c.color }}>{c.icon}</div>
            <div>
              <div className="stat-num">{loading ? '—' : c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="trend-section">
        <h2 className="section-heading">Hourly SOS Insights</h2>
        <div className="trend-card">
          <div className="chart-placeholder">
            <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C0392B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
                </linearGradient>

              </defs>
              <path d="M0,140 L50,110 L100,120 L150,60 L200,90 L250,40 L300,70 L350,20 L400,50 L400,160 L0,160 Z" fill="url(#grad)" />
              <path d="M0,140 L50,110 L100,120 L150,60 L200,90 L250,40 L300,70 L350,20 L400,50" fill="none" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="chart-labels">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
            </div>
          </div>
          <div className="trend-info">
             <div className="trend-stat"><span>High Volume Peak</span><strong>14:00 - 16:00</strong></div>
             <div className="trend-stat"><span>Avg Response Time</span><strong>{loading ? '--' : '4.2m'}</strong></div>
          </div>
        </div>
      </div>


      <h2 className="section-heading">Recent Emergencies</h2>
      <div className="table-card">
        {recentEmergencies.length === 0 ? (
          <p className="empty">No emergencies yet</p>
        ) : (
          <table>
            <thead>
              <tr><th>Time</th><th>Patient</th><th>Status</th><th>Ambulance</th><th>Hospital</th></tr>
            </thead>
            <tbody>
              {recentEmergencies.map((e: any) => (
                <tr key={e._id}>
                  <td>{new Date(e.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</td>
                  <td>{e.user?.name || 'Anonymous'}<br /><small>{e.user?.phone}</small></td>
                  <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                  <td>
                    {e.ambulance?.vehicleNumber || '—'}<br />
                    <small style={{ color: '#E67E22' }}>{e.userEmergencyContact ? 'Contact: ' + e.userEmergencyContact : ''}</small>
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
