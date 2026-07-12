import React from 'react';

export const Button = ({ children, type = 'button', onClick, disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: 'none',
        background: 'var(--accent)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        marginTop: '10px'
      }}
    >
      {children}
    </button>
  );
};