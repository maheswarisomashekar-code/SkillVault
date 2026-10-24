import React from 'react';

const CATEGORY_COLORS = {
  course: '#0ea5e9',
  internship: '#8b5cf6',
  hackathon: '#f59e0b',
  academic: '#10b981',
  workshop: '#ec4899',
  other: '#94a3b8'
};

const CATEGORY_LABELS = {
  course: 'Courses',
  internship: 'Internships',
  hackathon: 'Hackathons',
  academic: 'Academic',
  workshop: 'Workshops',
  other: 'Other Credentials'
};

export const SkillDistributionChart = ({ certificates = [] }) => {
  // Aggregate category counts
  const counts = {
    course: 0,
    internship: 0,
    hackathon: 0,
    academic: 0,
    workshop: 0,
    other: 0
  };

  certificates.forEach(c => {
    const cat = (c.category || 'other').toLowerCase();
    if (counts[cat] !== undefined) {
      counts[cat]++;
    } else {
      counts.other++;
    }
  });

  const total = certificates.length;

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No credential data recorded yet. Upload a certificate to populate live analytics.
      </div>
    );
  }

  // Active categories
  const activeCategories = Object.keys(counts)
    .filter(key => counts[key] > 0)
    .map(key => ({
      key,
      label: CATEGORY_LABELS[key] || key,
      count: counts[key],
      percentage: Math.round((counts[key] / total) * 100),
      color: CATEGORY_COLORS[key] || '#94a3b8'
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Category breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeCategories.map(cat => (
          <div key={cat.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }}></span>
                {cat.label}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {cat.count} ({cat.percentage}%)
              </span>
            </div>
            <div style={{
              height: '8px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${cat.percentage}%`,
                background: cat.color,
                borderRadius: '9999px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Tagline */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Total Records Evaluated</span>
        <strong style={{ color: '#0ea5e9', fontSize: '0.9rem' }}>{total} Credentials</strong>
      </div>
    </div>
  );
};
