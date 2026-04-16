import { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext';
import '../styles/pages.css';

interface Ambulance { _id: string; driverId: string; driverName: string; driverPhone: string; vehicleNumber: string; vehicleType: string; hospitalName: string; isOnline: boolean; isAvailable: boolean; }
interface Credentials { driverId: string; password: string; driverName: string; vehicleNumber: string; }

const emptyForm = { driverName: '', driverPhone: '', vehicleNumber: '', vehicleType: 'Basic' };

export default function Ambulances() {
  const { admin } = useAuth();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => { loadAmbulances(); }, [admin]);

  const loadAmbulances = async () => {
    try {
      // Only ambulances for this hospital
      const res = await api.get(`/ambulances${admin?.hospitalId ? `?hospitalId=${admin.hospitalId}` : ''}`);
      setAmbulances(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const register = async () => {
    if (!form.driverName || !form.driverPhone || !form.vehicleNumber) {
      showToast('❌ Driver name, phone and vehicle number required'); return;
    }
    setRegistering(true);
    try {
      const res = await api.post('/ambulances/register', {
        driverName: form.driverName,
        driverPhone: form.driverPhone,
        vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType,
        hospitalId: admin?.hospitalId,
        hospitalName: admin?.hospitalName
      });
      setCredentials(res.data.credentials);
      setShowForm(false);
      setForm(emptyForm);
      showToast('✅ Ambulance registered! Share credentials with driver.');
      loadAmbulances();
    } catch (err: any) { showToast('❌ ' + (err.response?.data?.message || 'Error')); }
    finally { setRegistering(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Remove this ambulance?')) return;
    try { await api.delete(`/ambulances/${id}`); showToast('Removed'); loadAmbulances(); }
    catch { showToast('❌ Error'); }
  };

  const copyCreds = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`MedFlow Driver Credentials\nDriver ID: ${credentials.driverId}\nPassword: ${credentials.password}\nName: ${credentials.driverName}\nVehicle: ${credentials.vehicleNumber}\nLogin app with: Ambulance Driver tab`);
    showToast('📋 Copied to clipboard!');
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ambulance Fleet</h1>
          <p className="page-sub">Fleet for <strong style={{ color: '#EAEAEA' }}>{admin?.hospitalName}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setCredentials(null); }}>+ Register Ambulance</button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="form-card">
          <h2 className="form-title">Register New Ambulance</h2>
          <div className="form-grid">
            <div className="field"><label>Driver Name *</label><input placeholder="Ramesh Kumar" value={form.driverName} onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))} /></div>
            <div className="field"><label>Driver Phone *</label><input placeholder="+91-98XXXXXXXX" value={form.driverPhone} onChange={e => setForm(f => ({ ...f, driverPhone: e.target.value }))} /></div>
            <div className="field"><label>Vehicle Number *</label><input placeholder="MP04 AB 1234" value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} /></div>
            <div className="field">
              <label>Vehicle Type</label>
              <select value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}>
                <option>Basic</option><option>Advanced</option><option>ICU</option>
              </select>
            </div>
          </div>
          <div className="form-note">🏥 Will be assigned to: <strong>{admin?.hospitalName}</strong></div>
          <div className="form-actions">
            <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={register} disabled={registering}>
              {registering ? 'Generating...' : '🔑 Generate Credentials'}
            </button>
          </div>
        </div>
      )}

      {/* Credentials */}
      {credentials && (
        <div className="credentials-card">
          <div className="cred-header">
            <span className="cred-title">✅ Driver Credentials — Give this to the driver</span>
            <button className="btn-sm btn-outline" onClick={copyCreds}>📋 Copy All</button>
          </div>
          <p className="cred-warning">⚠️ Password shown only once. Note it down!</p>
          <div className="cred-grid">
            <div className="cred-item"><label>Driver ID</label><code>{credentials.driverId}</code></div>
            <div className="cred-item"><label>Password</label><code>{credentials.password}</code></div>
            <div className="cred-item"><label>Driver Name</label><code>{credentials.driverName}</code></div>
            <div className="cred-item"><label>Vehicle No.</label><code>{credentials.vehicleNumber}</code></div>
          </div>
          <p className="cred-app-note">📱 Driver opens MedFlow app → "Ambulance Driver" tab → enters Driver ID + Password</p>
        </div>
      )}

      <div className="table-card">
        {ambulances.length === 0 ? (
          <p className="empty">No ambulances registered for your hospital yet</p>
        ) : (
          <table>
            <thead><tr><th>Driver ID</th><th>Driver</th><th>Vehicle</th><th>Type</th><th>Status</th><th>Available</th><th>Action</th></tr></thead>
            <tbody>
              {ambulances.map(a => (
                <tr key={a._id}>
                  <td><code className="driver-id">{a.driverId}</code></td>
                  <td><strong>{a.driverName}</strong><br /><small>{a.driverPhone}</small></td>
                  <td>{a.vehicleNumber}</td>
                  <td>{a.vehicleType}</td>
                  <td><span className={`badge ${a.isOnline ? 'badge-green' : 'badge-gray'}`}>{a.isOnline ? '🟢 Online' : '⚫ Offline'}</span></td>
                  <td><span className={`badge ${a.isAvailable ? 'badge-blue' : 'badge-amber'}`}>{a.isAvailable ? 'Free' : 'Busy'}</span></td>
                  <td><button className="btn-sm btn-danger" onClick={() => del(a._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
