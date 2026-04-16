import { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import '../styles/login.css';

interface Hospital { _id: string; hospitalName: string; area?: string; }

export default function Login() {
  const { login } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Load hospitals from DB for dropdown
  useEffect(() => {
    api.get('/hospitals?limit=50')
      .then(res => {
        setHospitals(res.data.data || []);
      })
      .catch(() => setError('Cannot connect to backend. Is server running?'))
      .finally(() => setLoadingHospitals(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedHospital) { setError('Please select your hospital'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true);
    try {
      await login(selectedHospital, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check password.');
    } finally {
      setLoading(false);
    }
  };

  const selectedHospitalName = hospitals.find(h => h._id === selectedHospital)?.hospitalName;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🏥</div>
        <h1 className="login-title">MedFlow</h1>
        <p className="login-sub">Hospital Admin Panel</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Select Your Hospital</label>
            {loadingHospitals ? (
              <div className="dropdown-loading">Loading hospitals...</div>
            ) : (
              <select
                value={selectedHospital}
                onChange={e => setSelectedHospital(e.target.value)}
                className="hospital-select">
                <option value="">— Choose Hospital —</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.hospitalName}{h.area ? ` (${h.area})` : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedHospitalName && (
              <div className="selected-badge">✓ {selectedHospitalName}</div>
            )}
          </div>

          <div className="field">
            <label>Admin Password</label>
            <input
              type="password"
              placeholder="Enter hospital admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-msg">⚠️ {error}</p>}

          <button type="submit" className="login-btn" disabled={loading || loadingHospitals}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <p className="login-hint">Default password: <code>hospital@123</code></p>
      </div>
    </div>
  );
}
