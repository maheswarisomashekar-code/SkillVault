import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = '#0ea5e9', trend }) => {
  const rgb = hexToRgb(color);
  return (
    <div 
      className="card stat-card-hover" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        '--card-accent-rgb': rgb
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div 
          className="stat-icon-wrapper"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: `rgba(${rgb}, 0.12)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '14, 165, 233';
}
