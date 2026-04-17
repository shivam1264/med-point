import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import '../styles/pages.css';

interface Hospital {
  _id: string; hospitalName: string; area: string; address: string; status: string;
  totalBeds: number; availableBeds: number; icuBeds: number; icuAvailable: number;
  ventilators: number; ventilatorsAvailable: number;
}

export default function BedManagement() {
  const { admin } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [localData, setLocalData] = useState({ icu: 0, general: 0, vent: 0, status: 'green' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { 
    if (admin) {
      const hid = admin.hospitalId || (admin as any).hospital;
      loadHospital(hid);
    }
  }, [admin]);

  const loadHospital = async (hid?: string) => {
    try {
      if (hid) {
        const res = await api.get(`/hospitals/${hid}`);
        const h = res.data.data || res.data;
        if (h && h._id) {
          setHospital(h);
          setLocalData({
            icu: h.icuAvailable ?? 0,
            general: h.availableBeds ?? 0,
            vent: h.ventilatorsAvailable ?? 0,
            status: h.status || 'green'
          });
          setLoading(false);
          return;
        }
      }
      throw new Error("Not found by ID");
    } catch (e) {
      // fallback: search in list by ID or by Name
      try {
        const res = await api.get(`/hospitals?limit=100`);
        const list = res.data.data || [];
        const found = list.find((h: Hospital) => 
          (hid && h._id === hid) || 
          (admin?.hospitalName && h.hospitalName === admin.hospitalName)
        );
        if (found) {
          setHospital(found);
          setLocalData({ icu: found.icuAvailable ?? 0, general: found.availableBeds ?? 0, vent: found.ventilatorsAvailable ?? 0, status: found.status || 'green' });
        }
      } catch (_) {}
    }
    finally { setLoading(false); }
  };

  const change = (field: 'icu' | 'general' | 'vent', delta: number) => {
    setLocalData(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
  };

  const save = async () => {
    if (!hospital) return;
    setSaving(true);
    try {
      await api.patch(`/hospitals/${hospital._id}/beds`, {
        icuAvailable: localData.icu,
        availableBeds: localData.general,
        ventilatorsAvailable: localData.vent,
        status: localData.status
      });
      showToast('✅ Bed data updated successfully!');
    } catch { showToast('❌ Save failed'); }
    finally { setSaving(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="page"><div className="loading">Loading your hospital data...</div></div>;
  if (!hospital) return <div className="page"><div className="loading">Hospital not found.</div></div>;

  const beds: { field: 'icu' | 'general' | 'vent'; label: string; total: number }[] = [
    { field: 'icu', label: 'ICU Beds Available', total: hospital.icuBeds },
    { field: 'general', label: 'General Beds Available', total: hospital.totalBeds },
    { field: 'vent', label: 'Ventilators Available', total: hospital.ventilators },
  ];

  const icuPct = hospital.icuBeds ? Math.round((localData.icu / hospital.icuBeds) * 100) : 0;
  const generalPct = hospital.totalBeds ? Math.round((localData.general / hospital.totalBeds) * 100) : 0;

  return (
    <div className="page">
      <h1 className="page-title">Bed Management</h1>
      <p className="page-sub">Live bed availability for <strong style={{ color: '#EAEAEA' }}>{hospital.hospitalName}</strong></p>

      {/* Hospital summary */}
      <div className="hosp-summary-card">
        <div className="hosp-summary-left">
          <div className="hosp-summary-name">{hospital.hospitalName}</div>
          <div className="hosp-summary-area">{hospital.area || hospital.address}</div>
          <div className="hosp-progress-row">
            <span className="hosp-progress-label">ICU {icuPct}% free</span>
            <div className="hosp-progress-bar">
              <div className="hosp-progress-fill" style={{ width: `${icuPct}%`, backgroundColor: icuPct > 50 ? '#27AE60' : icuPct > 20 ? '#F39C12' : '#C0392B' }} />
            </div>
          </div>
          <div className="hosp-progress-row">
            <span className="hosp-progress-label">General {generalPct}% free</span>
            <div className="hosp-progress-bar">
              <div className="hosp-progress-fill" style={{ width: `${generalPct}%`, backgroundColor: generalPct > 50 ? '#27AE60' : generalPct > 20 ? '#F39C12' : '#C0392B' }} />
            </div>
          </div>
        </div>
        <div>
          <label className="field-label">Overall Status</label>
          <select className="status-select" value={localData.status} onChange={e => setLocalData(d => ({ ...d, status: e.target.value }))}>
            <option value="green">🟢 Available</option>
            <option value="amber">🟡 Moderate</option>
            <option value="red">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* Bed counters */}
      <div className="bed-counters-grid">
        {beds.map(b => (
          <div className="bed-counter-card" key={b.field}>
            <div className="bed-label">{b.label}</div>
            <div className="bed-total-note">Total capacity: {b.total}</div>
            <div className="bed-counter">
              <button className="counter-btn" onClick={() => change(b.field, -1)}>−</button>
              <span className="counter-val">{localData[b.field]}</span>
              <button className="counter-btn" onClick={() => change(b.field, 1)}>+</button>
            </div>
            <div className="bed-pct-bar">
              <div
                className="bed-pct-fill"
                style={{
                  width: b.total ? `${Math.round((localData[b.field] / b.total) * 100)}%` : '0%',
                  backgroundColor: '#C0392B'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="save-btn-big" onClick={save} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save Bed Data'}
      </button>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
