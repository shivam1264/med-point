import { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext';
import '../styles/pages.css';

interface Doctor {
  _id: string; name: string; specialty: string; qualification: string;
  experience: number; phone: string; consultationFee: number;
  availableStatus: string; hospitalName: string; hospital: string;
}

const emptyForm = { name: '', specialty: '', qualification: '', experience: '', phone: '', consultationFee: '' };

export default function Doctors() {
  const { admin } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDoctors(); }, [admin]);

  const loadDoctors = async () => {
    try {
      // Filter doctors by this hospital only
      const res = await api.get(`/doctors${admin?.hospitalId ? `?hospitalId=${admin.hospitalId}` : ''}`);
      setDoctors(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (d: Doctor) => {
    setForm({ name: d.name, specialty: d.specialty, qualification: d.qualification || '', experience: String(d.experience || ''), phone: d.phone || '', consultationFee: String(d.consultationFee || '') });
    setEditId(d._id); setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.specialty) { showToast('❌ Name and specialty required'); return; }
    try {
      const body = {
        ...form,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
        hospital: admin?.hospitalId,
        hospitalName: admin?.hospitalName
      };
      if (editId) {
        await api.put(`/doctors/${editId}`, body);
        showToast('✅ Doctor updated');
      } else {
        await api.post('/doctors', body);
        showToast('✅ Doctor added');
      }
      setShowForm(false);
      loadDoctors();
    } catch (err: any) { showToast('❌ ' + (err.response?.data?.message || 'Error')); }
  };

  const del = async (id: string) => {
    if (!confirm('Remove this doctor?')) return;
    try { await api.delete(`/doctors/${id}`); showToast('Doctor removed'); loadDoctors(); }
    catch { showToast('❌ Error'); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const statusBadge = (s: string) => s === 'available' ? 'badge-green' : s === 'busy' ? 'badge-amber' : 'badge-gray';

  if (loading) return <div className="page"><div className="loading">Loading doctors...</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-sub">Doctors at <strong style={{ color: '#EAEAEA' }}>{admin?.hospitalName}</strong></p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">{editId ? 'Edit Doctor' : 'Add Doctor'}</h2>
          <div className="form-grid">
            <div className="field"><label>Full Name *</label><input placeholder="Dr. Raj Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="field"><label>Specialty *</label><input placeholder="Cardiology" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div className="field"><label>Qualification</label><input placeholder="MD, DM" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} /></div>
            <div className="field"><label>Experience (yrs)</label><input type="number" placeholder="10" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} /></div>
            <div className="field"><label>Phone</label><input placeholder="+91-98XXXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="field"><label>Consultation Fee (₹)</label><input type="number" placeholder="500" value={form.consultationFee} onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))} /></div>
          </div>
          <div className="form-note">🏥 Will be added to: <strong>{admin?.hospitalName}</strong></div>
          <div className="form-actions">
            <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Doctor</button>
          </div>
        </div>
      )}

      <input className="search-input" placeholder="🔍  Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="table-card">
        {filtered.length === 0 ? (
          <p className="empty">{doctors.length === 0 ? 'No doctors added yet for your hospital' : 'No doctors match your search'}</p>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Specialty</th><th>Qualification</th><th>Experience</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.specialty}</td>
                  <td>{d.qualification || '—'}</td>
                  <td>{d.experience ? d.experience + ' yrs' : '—'}</td>
                  <td>{d.consultationFee ? '₹' + d.consultationFee : '—'}</td>
                  <td><span className={`badge ${statusBadge(d.availableStatus)}`}>{d.availableStatus}</span></td>
                  <td>
                    <button className="btn-sm btn-outline" onClick={() => openEdit(d)}>Edit</button>{' '}
                    <button className="btn-sm btn-danger" onClick={() => del(d._id)}>Delete</button>
                  </td>
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
