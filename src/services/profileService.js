import { 
  db, 
  isFirebaseConfigured, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from '../config/firebase';

const LOCAL_PROFILES_KEY = 'skillvault_local_profiles';

const DEMO_EVALUATOR_PROFILE = {
  fullName: 'Arjun Sharma',
  email: 'arjun.ise@student.edu',
  usn: '1IS22CS042',
  institution: 'Department of Information Science & Engineering',
  degree: 'Bachelor of Engineering (ISE)',
  semester: '5th Semester',
  bio: 'Information Science student passionate about cloud architecture, serverless deployments, and intelligent systems.',
  skills: ['Cloud Computing', 'Firebase', 'React.js', 'Google Cloud Platform', 'REST APIs', 'OCR Processing'],
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  isPortfolioPublic: true,
  themeColor: '#0ea5e9'
};

const createBlankProfile = (userId, email = '', displayName = '') => ({
  userId,
  fullName: displayName || (email ? email.split('@')[0] : 'Student'),
  email: email,
  usn: '',
  institution: '',
  degree: '',
  semester: '',
  bio: '',
  skills: [],
  github: '',
  linkedin: '',
  isPortfolioPublic: true,
  themeColor: '#0ea5e9'
});

export const getUserProfile = async (userId, userDetails = {}) => {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (e) {
      console.warn('Error fetching user profile from Firestore:', e);
    }
  }

  // Fallback / local storage
  const local = JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  if (local[userId]) {
    // Sanitize any previously auto-injected academic placeholders for custom student accounts
    if (userId !== 'student_cloud_demo_01') {
      let modified = false;
      const p = local[userId];
      if (p.institution === 'Department of Information Science & Engineering') {
        p.institution = '';
        modified = true;
      }
      if (p.degree === 'B.E. Information Science and Engineering' || p.degree === 'Bachelor of Engineering (ISE)') {
        p.degree = '';
        modified = true;
      }
      if (p.semester === '5th Semester' && (!p.usn || p.usn.startsWith('1MS22') || p.usn.startsWith('1IS22'))) {
        p.semester = '';
        modified = true;
      }
      if (modified) {
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(local));
      }
    }
    return local[userId];
  }

  // If this is the specific 1-click demo evaluator account, use demo data
  if (userId === 'student_cloud_demo_01') {
    return { ...DEMO_EVALUATOR_PROFILE, userId };
  }

  // For any custom user, create a clean profile with their actual details
  const newProfile = createBlankProfile(userId, userDetails.email, userDetails.displayName);
  local[userId] = newProfile;
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(local));
  return newProfile;
};

export const saveUserProfile = async (userId, profileData) => {
  const payload = {
    ...profileData,
    userId,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, payload, { merge: true });
      return payload;
    } catch (e) {
      console.error('Error saving profile to Firestore:', e);
    }
  }

  const local = JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  local[userId] = payload;
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(local));
  return payload;
};
