import React, { useState } from 'react';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { loginUser } from '../api/auth';

export const Login = ({ onSwitchPage, onAuthSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(formData);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', border: '1px solid var(--border)', borderRadius: '8px' }}>
      <h2>Welcome Back</h2>
      <p style={{ marginBottom: '20px' }}>Sign in to your Transitops workspace</p>
      
      {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'left' }}>⚠️ {error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        New to Transitops?{' '}
        <span onClick={onSwitchPage} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '500' }}>
          Create an account
        </span>
      </p>
    </div>
  );
};