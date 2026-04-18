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

  useEffect(() => {
    api.get('/hospitals?limit=50')
      .then(res => {
        setHospitals(res.data.data || []);
      })
      .catch(() => setError('Connection failed. Please check your backend server.'))
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
      setError(err.response?.data?.message || 'Authentication failed. Please verify your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-wrapper">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <h1 className="login-title">MedFlow</h1>
        <p className="login-sub">Administrative Management Portal</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Provider Location</label>
            {loadingHospitals ? (
              <div className="hospital-select" style={{ color: '#999' }}>Retrieving hospital list...</div>
            ) : (
              <select
                value={selectedHospital}
                onChange={e => setSelectedHospital(e.target.value)}
                className="hospital-select">
                <option value="">— Select Hospital —</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.hospitalName}{h.area ? ` (${h.area})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="field">
            <label>Security Key</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading || loadingHospitals}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="login-hint">Restricted access. Use default: <code>hospital@123</code></p>
      </div>
    </div>
  );
}
