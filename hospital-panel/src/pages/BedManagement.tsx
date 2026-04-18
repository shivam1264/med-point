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
      if (!hid) return;
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
      }
    } catch (_) {
      console.error("Hospital record not found.");
    } finally {
      setLoading(false);
    }
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
      showToast('✅ Availability synced successfully');
    } catch { showToast('❌ Synchronization failed'); }
    finally { setSaving(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="page"><div className="loading">Retrieving inventory...</div></div>;
  if (!hospital) return <div className="page"><div className="loading">Hospital record not found.</div></div>;

  const beds: { field: 'icu' | 'general' | 'vent'; label: string; total: number; color: string }[] = [
    { field: 'icu', label: 'ICU Beds', total: hospital.icuBeds, color: 'var(--primary)' },
    { field: 'general', label: 'General Beds', total: hospital.totalBeds, color: 'var(--success)' },
    { field: 'vent', label: 'Ventilators', total: hospital.ventilators, color: 'var(--warning)' },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Resource Inventory</h1>
          <p className="page-sub">Manage real-time availability for <strong>{hospital.hospitalName}</strong></p>
        </div>
        <div>
          <select 
            className={`status-inline-select ${localData.status === 'green' ? 'badge-green' : localData.status === 'amber' ? 'badge-amber' : 'badge-red'}`} 
            value={localData.status} 
            onChange={e => setLocalData(d => ({ ...d, status: e.target.value }))}
            style={{ padding: '10px 16px' }}
          >
            <option value="green">🟢 Critical: Normal</option>
            <option value="amber">🟡 Critical: Moderate</option>
            <option value="red">🔴 Critical: High</option>
          </select>
        </div>
      </header>

      <div className="bed-counters-grid">
        {beds.map(b => (
          <div className="bed-counter-card" key={b.field}>
            <div className="bed-label">{b.label}</div>
            <div className="bed-total-note">Capacity: {b.total || '—'}</div>
            <div className="bed-counter">
              <button className="counter-btn" onClick={() => change(b.field, -1)}>−</button>
              <span className="counter-val">{localData[b.field]}</span>
              <button className="counter-btn" onClick={() => change(b.field, 1)}>+</button>
            </div>
            <div className="bed-pct-bar" style={{ marginTop: '24px' }}>
              <div
                className="bed-pct-fill"
                style={{
                  width: b.total ? `${Math.min(100, Math.round((localData[b.field] / b.total) * 100))}%` : '0%',
                  backgroundColor: b.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }} onClick={save} disabled={saving}>
          {saving ? 'Syncing...' : 'Update Inventory'}
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
