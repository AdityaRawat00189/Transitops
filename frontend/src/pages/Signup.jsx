import React, { useState } from 'react';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { registerUser } from '../api/auth';

export const Signup = ({ onSwitchPage, onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Driver', // Match model enum
  });
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
      const data = await registerUser(formData);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', border: '1px solid var(--border)', borderRadius: '8px' }}>
      <h2>Create Account</h2>
      <p style={{ marginBottom: '20px' }}>Join Transitops Management System</p>
      
      {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'left' }}>⚠️ {error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
        
        <Input label="System Role" type="select" name="role" value={formData.role} onChange={handleChange} required>
          <option value="Driver">Driver</option>
          <option value="FleetManager">Fleet Manager</option>
          <option value="SafetyOfficer">Safety Officer</option>
          <option value="FinancialAnalyst">Financial Analyst</option>
        </Input>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Already have an account?{' '}
        <span onClick={onSwitchPage} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '500' }}>
          Login here
        </span>
      </p>
    </div>
  );
};