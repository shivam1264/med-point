import { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext';
import '../styles/pages.css';

interface Stats { hospitals: number; doctors: number; ambulances: number; emergencies: number; }

export default function Dashboard() {
  const { admin } = useAuth();
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
      const hid = admin?.hospitalId;
      const [docs, ambs, emers] = await Promise.all([
        api.get(`/doctors${hid ? `?hospitalId=${hid}` : ''}`),
        api.get(`/ambulances${hid ? `?hospitalId=${hid}` : ''}`),
        api.get(`/emergencies${hid ? `?hospitalId=${hid}` : ''}`),
      ]);
      const doctors_list = docs.data.data || [];
      const ambulances_list = ambs.data.data || [];
      const emergencies_list = emers.data.data || [];

      // Safety filter: double-check that all displayed emergencies are for this hospital
      const filteredEmergencies = emergencies_list.filter((e: any) => 
        (e.hospital === hid) || 
        (e.hospital?._id === hid) || 
        (e.hospitalName === admin?.hospitalName)
      );
      const filteredDoctors = doctors_list.filter((d: any) => d.hospital === hid || d.hospital?._id === hid);
      const filteredAmbulances = ambulances_list.filter((a: any) => a.hospital === hid || a.hospital?._id === hid);

      setStats({
        hospitals: 1,
        doctors: filteredDoctors.length,
        ambulances: filteredAmbulances.length,
        emergencies: filteredEmergencies.length,
      });
      setRecentEmergencies(filteredEmergencies.slice(0, 8));
    } catch (_) {}
    finally { setLoading(false); }
  };

  const statCards = [
    { icon: '👨‍⚕️', value: stats.doctors, label: 'Doctors', color: 'var(--success)' },
    { icon: '🚑', value: stats.ambulances, label: 'Ambulances', color: 'var(--primary)' },
    { icon: '🆘', value: stats.emergencies, label: 'Today Cases', color: 'var(--warning)' },
    { icon: '🏥', value: 'Active', label: 'Hospital Status', color: 'var(--danger)' },
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
        <h1 className="page-title">{admin?.hospitalName || 'Healthcare Dashboard'}</h1>
        <p className="page-sub">Central Management Terminal for <strong>{admin?.hospitalName}</strong></p>
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
