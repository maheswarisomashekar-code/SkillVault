import { 
  db, 
  isFirebaseConfigured, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from '../config/firebase';

const LOCAL_PROFILES_KEY = 'skillvault_local_profiles';

const defaultProfile = {
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

export const getUserProfile = async (userId) => {
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
  return local[userId] || { ...defaultProfile, userId };
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
