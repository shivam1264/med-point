import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import '../styles/pages.css';

interface Emergency {
  _id: string; status: string; severity: string; createdAt: string;
  location: { lat: number; lng: number; address?: string };
  user?: { name: string; phone: string };
  ambulance?: { vehicleNumber: string; driverName: string };
  hospitalName?: string;
}

const statusBadge = (s: string) => {
  const m: Record<string, string> = { pending: 'badge-amber', accepted: 'badge-blue', in_progress: 'badge-blue', completed: 'badge-green', cancelled: 'badge-gray' };
  return m[s] || 'badge-gray';
};
const severityBadge = (s: string) => s === 'critical' ? 'badge-red' : s === 'moderate' ? 'badge-amber' : 'badge-gray';

export default function Emergencies() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = async () => {
    try {
      const res = await api.get('/emergencies');
      setEmergencies(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? emergencies : emergencies.filter(e => e.status === filter);

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Emergency Cases</h1>
          <p className="page-sub">Live SOS alerts — auto-refreshes every 10s</p>
        </div>
        <div className="live-badge">🔴 LIVE</div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'Overall View' : f.replace('_', ' ')}
            {f === 'pending' && emergencies.filter(e => e.status === 'pending').length > 0 && (
              <span className="filter-count">
                {emergencies.filter(e => e.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="table-card">
        {filtered.length === 0 ? <p className="empty">No emergency cases {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p> : (
          <table>
            <thead>
              <tr><th>Time</th><th>Patient</th><th>Location</th><th>Severity</th><th>Status</th><th>Ambulance</th><th>Hospital</th></tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(e.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </td>
                  <td>
                    <strong>{e.user?.name || 'Anonymous'}</strong>
                    {e.user?.phone && <><br /><small>{e.user.phone}</small></>}
                  </td>
                  <td style={{ fontSize: '12px', maxWidth: '160px' }}>
                    {e.location?.address || `${e.location?.lat?.toFixed(4)}, ${e.location?.lng?.toFixed(4)}`}
                  </td>
                  <td><span className={`badge ${severityBadge(e.severity)}`}>{e.severity || 'critical'}</span></td>
                  <td><span className={`badge ${statusBadge(e.status)}`}>{e.status.replace('_', ' ')}</span></td>
                  <td>{e.ambulance?.vehicleNumber || '—'}{e.ambulance?.driverName && <><br /><small>{e.ambulance.driverName}</small></>}</td>
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
