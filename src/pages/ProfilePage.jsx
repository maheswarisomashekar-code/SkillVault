import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  CheckCircle2, 
  GraduationCap, 
  Building, 
  Hash, 
  FileText, 
  Plus, 
  X, 
  Globe
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/profileService';

export const ProfilePage = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    usn: '',
    institution: '',
    degree: '',
    semester: '',
    bio: '',
    skills: [],
    github: '',
    linkedin: '',
    isPortfolioPublic: true
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || currentUser?.displayName || '',
        email: userProfile.email || currentUser?.email || '',
        usn: userProfile.usn || '',
        institution: userProfile.institution || '',
        degree: userProfile.degree || '',
        semester: userProfile.semester || '',
        bio: userProfile.bio || '',
        skills: userProfile.skills || [],
        github: userProfile.github || '',
        linkedin: userProfile.linkedin || '',
        isPortfolioPublic: userProfile.isPortfolioPublic !== false
      });
    }
  }, [userProfile, currentUser]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    // Split by comma if user enters comma-separated skills like "Python, Cloud, React"
    const splitSkills = newSkill
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedSkills = [...formData.skills];
    splitSkills.forEach(skill => {
      if (!updatedSkills.includes(skill)) {
        updatedSkills.push(skill);
      }
    });

    setFormData({
      ...formData,
      skills: updatedSkills
    });
    setNewSkill('');
  };

  const validateUrl = (url, expectedHost) => {
    if (!url || !url.trim()) return { valid: true };
    const trimmed = url.trim();

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: `Invalid protocol. URL must start with https://` };
      }
      if (expectedHost && !parsed.hostname.toLowerCase().includes(expectedHost)) {
        return { valid: false, error: `Please enter a valid ${expectedHost} URL (e.g. https://${expectedHost}.com/your-username)` };
      }

      // Check for generic homepage URLs like https://github.com or https://github.com/
      const pathname = parsed.pathname.replace(/^\/+|\/+$/g, '');
      if (expectedHost && !pathname) {
        return { valid: false, error: `Please include your specific username in your ${expectedHost} URL (e.g. https://${expectedHost}.com/your-username)` };
      }

      return { valid: true, sanitized: trimmed };
    } catch {
      return { valid: false, error: `Invalid web address format. Please enter a valid URL starting with https://` };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false);

    // Validate USN
    if (!formData.usn || !formData.usn.trim()) {
      setFormError('Please enter your University Seat Number (USN).');
      return;
    }

    // Validate GitHub URL
    if (formData.github && formData.github.trim()) {
      const githubCheck = validateUrl(formData.github, 'github');
      if (!githubCheck.valid) {
        setFormError(`GitHub URL Error: ${githubCheck.error}`);
        return;
      }
    }

    // Validate LinkedIn URL
    if (formData.linkedin && formData.linkedin.trim()) {
      const linkedinCheck = validateUrl(formData.linkedin, 'linkedin');
      if (!linkedinCheck.valid) {
        setFormError(`LinkedIn URL Error: ${linkedinCheck.error}`);
        return;
      }
    }

    setSaving(true);
    try {
      await saveUserProfile(currentUser.uid, formData);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setFormError('Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Student Academic Profile
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Manage your personal information, department details, and skills displayed on your public portfolio
        </p>
      </div>

      {success && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <CheckCircle2 size={18} />
          <span>Profile changes saved successfully to Cloud Firestore!</span>
        </div>
      )}

      {formError && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <span>⚠️ {formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">University Seat Number (USN) *</label>
            <input 
              type="text" 
              className="form-input" 
              required
              placeholder="Enter your USN (e.g. 1RV22CS001)"
              value={formData.usn}
              onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Semester</label>
            <select 
              className="form-select"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            >
              <option value="">Select Semester</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="3rd Semester">3rd Semester</option>
              <option value="4th Semester">4th Semester</option>
              <option value="5th Semester">5th Semester</option>
              <option value="6th Semester">6th Semester</option>
              <option value="7th Semester">7th Semester</option>
              <option value="8th Semester">8th Semester</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Degree / Branch</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="e.g. B.E. Computer Science, ISE, ECE, Mechanical..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Institution / Department</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g. College / University Department Name"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Professional Summary / Bio</label>
          <textarea 
            className="form-textarea" 
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="A brief overview of your technical focus, projects, and career aspirations..."
          />
        </div>

        {/* Skills Tag Input */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Verified Skill Demonstration Tags</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Add skill (e.g. Cloud Architecture, Docker, Python)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {formData.skills.map((skill, index) => (
              <span 
                key={index}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{skill}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Social / External Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          <div className="form-group">
            <label className="form-label">GitHub Profile URL</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://github.com/..."
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn Profile URL</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
