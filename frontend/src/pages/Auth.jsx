import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/auth';
import './Auth.css';

export const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FleetManager'
  });

  const roles = [
    { id: 'FleetManager', abbr: 'FM', name: 'Fleet Manager' },
    { id: 'Driver', abbr: 'DR', name: 'Driver' },
    { id: 'SafetyOfficer', abbr: 'SO', name: 'Safety Officer' },
    { id: 'FinancialAnalyst', abbr: 'FA', name: 'Financial Analyst' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleId) => {
    setFormData({ ...formData, role: roleId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginUser({ email: formData.email, password: formData.password });
      } else {
        data = await registerUser(formData);
      }
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="badge">
            <div className="badge-dot"></div>
            SECURE CHANNEL
          </div>
          <div style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>
            § 3.1 • AUTH
          </div>
        </div>

        <h1 className="auth-title">Access the console</h1>
        <p className="auth-subtitle">
          {isLogin ? "Use your organization credentials. New here? " : "Register for an access terminal. Already have one? "}
          <span className="auth-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Request access." : "Login here."}
          </span>
        </p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <div className="form-label">Role</div>
            <div className="role-grid">
              {roles.map((r) => (
                <div 
                  key={r.id} 
                  className={`role-card ${formData.role === r.id ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(r.id)}
                >
                  <div className="role-abbr">{r.abbr}</div>
                  <div className="role-name">{r.name}</div>
                </div>
              ))}
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <div className="form-label">Full Name</div>
              <div className="input-wrapper">
                <span className="input-icon">#</span>
                <input type="text" name="name" className="auth-input" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="form-label">Email</div>
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input type="email" name="email" className="auth-input" placeholder="alex@fleet.co" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Password</span>
              {isLogin && <span style={{ color: '#22c55e', cursor: 'pointer' }}>FORGOT?</span>}
            </div>
            <div className="input-wrapper">
              <span className="input-icon">..</span>
              <input type="password" name="password" className="auth-input" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <label className="checkbox-group">
            <input type="checkbox" style={{ accentColor: '#facc15', width: '16px', height: '16px' }} />
            Keep me signed in on this workstation
          </label>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Enter console'} ↗
          </button>
        </form>

        <div className="divider">OR</div>

        <div className="alt-login-grid">
          <button type="button" className="alt-btn">
            <span>SSO</span> Single sign-on
          </button>
          <button type="button" className="alt-btn">
            <span>OTP</span> Email code
          </button>
        </div>

        <p className="footer-text">
          By continuing, you agree to the fleet acceptable-use policy and audit logging of dispatch actions.
        </p>

        <a href="#" className="back-link">
          ← BACK TO OVERVIEW
        </a>
      </div>
    </div>
  );
};