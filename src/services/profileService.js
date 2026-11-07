import { 
  db, 
  isFirebaseConfigured, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from '../config/firebase';

const LOCAL_PROFILES_KEY = 'skillvault_local_profiles';

/**
 * Dynamically extracts verified competencies & technical skills
 * directly from the candidate's actual certificates and credentials!
 */
export const extractSkillsFromCertificates = (certificates = []) => {
  const skillsSet = new Set();

  certificates.forEach(cert => {
    // Only inspect the course title and issuer (not the app's internal OCR scan metadata)
    const text = `${cert.title || ''} ${cert.issuer || ''}`.toLowerCase();

    // 1. Environmental, Policy & Sustainability
    if (text.includes('environment') || text.includes('sustainability') || text.includes('climate') || text.includes('policy') || text.includes('jindal')) {
      skillsSet.add('Environmental Policy & Governance');
      skillsSet.add('Environmental Impact Assessment (EIA)');
      skillsSet.add('Sustainability Practice');
      skillsSet.add('Climate Action & SDGs');
    }

    // 2. Google Cloud Platform
    if (text.includes('google cloud') || text.includes('gcp') || text.includes('associate cloud engineer')) {
      skillsSet.add('Google Cloud Platform (GCP)');
      skillsSet.add('Cloud Deployment & Operations');
    }

    // 3. Containerization & Kubernetes
    if (text.includes('kubernetes') || text.includes('containerization') || text.includes('docker') || text.includes('microservices')) {
      skillsSet.add('Kubernetes Orchestration');
      skillsSet.add('Docker Containers');
      skillsSet.add('Microservices Architecture');
    }

    // 4. AWS, Cloud Storage & Serverless
    if (text.includes('aws') || text.includes('amazon') || text.includes('serverless') || text.includes('s3') || text.includes('ec2') || text.includes('lambda')) {
      skillsSet.add('Amazon Web Services (AWS)');
      skillsSet.add('Serverless Architecture');
      skillsSet.add('AWS S3 Cloud Storage');
    }

    // 5. DevOps, CI/CD & Cloud Infrastructure
    if (text.includes('devops') || text.includes('ci/cd') || text.includes('terraform') || text.includes('pipeline')) {
      skillsSet.add('DevOps Automation');
      skillsSet.add('CI/CD Pipelines');
    }

    // 6. Hackathons & Rapid MVP Prototyping
    if (text.includes('hackathon') || text.includes('first prize') || text.includes('winner') || text.includes('innovation')) {
      skillsSet.add('Rapid Prototyping');
      skillsSet.add('Agile Sprint Engineering');
    }

    // 7. AI & Machine Learning
    if (text.includes('machine learning') || text.includes('artificial intelligence') || text.includes('deep learning')) {
      skillsSet.add('Machine Learning & AI');
      skillsSet.add('Neural Networks');
    }

    // 8. Python & Data Science
    if (text.includes('python') || text.includes('data science') || text.includes('pandas') || text.includes('analytics')) {
      skillsSet.add('Python Engineering');
      skillsSet.add('Data Analytics');
    }

    // 9. Economics & Financial Analysis
    if (text.includes('economic') || text.includes('economics') || text.includes('finance') || text.includes('econometric')) {
      skillsSet.add('Economic Analysis');
      skillsSet.add('Financial Econometrics');
    }
  });

  return Array.from(skillsSet);
};

const DEMO_EVALUATOR_PROFILE = {
  fullName: 'Student Candidate',
  email: 'student@ise.edu',
  usn: '',
  institution: '',
  degree: 'Bachelor of Engineering',
  semester: '',
  bio: 'Engineering student managing verified digital credentials, cloud architectures, and academic achievements.',
  skills: [],
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
        const data = snapshot.data();
        if (userId !== 'student_cloud_demo_01') {
          if (data.institution === 'Department of Information Science & Engineering') data.institution = '';
          if (data.degree === 'B.E. Information Science and Engineering' || data.degree === 'Bachelor of Engineering (ISE)') data.degree = '';
          if (data.semester === '5th Semester' && (!data.usn || data.usn.startsWith('1MS22') || data.usn.startsWith('1IS22'))) data.semester = '';
          if (Array.isArray(data.skills) && data.skills.includes('Database Management') && data.skills.includes('Web Development')) data.skills = [];
        }
        return data;
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
      if (Array.isArray(p.skills) && p.skills.includes('Database Management') && p.skills.includes('Web Development')) {
        p.skills = [];
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
