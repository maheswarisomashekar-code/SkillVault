import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from '../config/firebase';

const LOCAL_PROJECTS_KEY = 'skillvault_local_projects';
const LOCAL_EXPERIENCES_KEY = 'skillvault_local_experiences';

/**
 * Extracts username from a GitHub profile or repository URL
 * e.g. "https://github.com/jayanth-dev/cloud-app" -> { owner: "jayanth-dev", repo: "cloud-app" }
 * e.g. "https://github.com/jayanth-dev" -> { username: "jayanth-dev" }
 */
export const extractGithubOwner = (url = '') => {
  if (!url) return null;
  const match = url.trim().match(/github\.com\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_.-]+))?/i);
  if (!match) return null;
  return {
    owner: match[1].toLowerCase(),
    repo: match[2] ? match[2].replace(/\.git$/i, '') : null
  };
};

/**
 * Validates whether a project's repository belongs to the student's registered GitHub handle
 */
export const verifyRepoOwnership = (repoUrl = '', studentGithubUrl = '') => {
  if (!repoUrl) return { isVerified: false, status: 'NO_REPO' };
  
  const repoInfo = extractGithubOwner(repoUrl);
  if (!repoInfo || !repoInfo.owner) {
    return { isVerified: false, status: 'INVALID_URL' };
  }

  if (!studentGithubUrl) {
    return { isVerified: false, status: 'NO_STUDENT_GITHUB', repoOwner: repoInfo.owner };
  }

  const studentInfo = extractGithubOwner(studentGithubUrl);
  if (!studentInfo || !studentInfo.owner) {
    return { isVerified: false, status: 'UNVERIFIED', repoOwner: repoInfo.owner };
  }

  const isMatch = repoInfo.owner.toLowerCase() === studentInfo.owner.toLowerCase();
  return {
    isVerified: isMatch,
    status: isMatch ? 'VERIFIED_OWNER' : 'OWNER_MISMATCH',
    repoOwner: repoInfo.owner,
    studentOwner: studentInfo.owner
  };
};

/**
 * Fetch all projects for a specific student
 */
export const getStudentProjects = async (userId, publicOnly = false) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = publicOnly 
        ? query(collection(db, 'projects'), where('userId', '==', userId), where('isPublished', '==', true))
        : query(collection(db, 'projects'), where('userId', '==', userId));
      
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    } catch (e) {
      console.warn('Failed to fetch projects from Firestore, falling back to local storage:', e);
    }
  }

  // Local storage fallback
  const all = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '{}');
  const userProjects = all[userId] || [];
  const filtered = publicOnly ? userProjects.filter(p => p.isPublished !== false) : userProjects;
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Save or update a project
 */
export const saveStudentProject = async (userId, projectData) => {
  const projectId = projectData.id || `proj_${Date.now()}`;
  const record = {
    ...projectData,
    id: projectId,
    userId,
    isPublished: projectData.isPublished !== false,
    createdAt: projectData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'projects', projectId);
      await setDoc(ref, record, { merge: true });
    } catch (e) {
      console.warn('Failed to write project to Firestore:', e);
    }
  }

  const all = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '{}');
  if (!all[userId]) all[userId] = [];
  const existingIdx = all[userId].findIndex(p => p.id === projectId);
  if (existingIdx !== -1) {
    all[userId][existingIdx] = record;
  } else {
    all[userId].unshift(record);
  }
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(all));
  return record;
};

/**
 * Delete a project
 */
export const deleteStudentProject = async (userId, projectId) => {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'projects', projectId);
      await deleteDoc(ref);
    } catch (e) {
      console.warn('Failed to delete project from Firestore:', e);
    }
  }

  const all = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '{}');
  if (all[userId]) {
    all[userId] = all[userId].filter(p => p.id !== projectId);
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(all));
  }
  return true;
};

/**
 * Fetch all experience / internship entries for a specific student
 */
export const getStudentExperiences = async (userId, publicOnly = false) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = publicOnly 
        ? query(collection(db, 'experiences'), where('userId', '==', userId), where('isPublished', '==', true))
        : query(collection(db, 'experiences'), where('userId', '==', userId));
      
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    } catch (e) {
      console.warn('Failed to fetch experiences from Firestore, falling back to local storage:', e);
    }
  }

  const all = JSON.parse(localStorage.getItem(LOCAL_EXPERIENCES_KEY) || '{}');
  const userExps = all[userId] || [];
  const filtered = publicOnly ? userExps.filter(e => e.isPublished !== false) : userExps;
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Save or update an experience record
 */
export const saveStudentExperience = async (userId, expData) => {
  const expId = expData.id || `exp_${Date.now()}`;
  const record = {
    ...expData,
    id: expId,
    userId,
    isPublished: expData.isPublished !== false,
    createdAt: expData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'experiences', expId);
      await setDoc(ref, record, { merge: true });
    } catch (e) {
      console.warn('Failed to write experience to Firestore:', e);
    }
  }

  const all = JSON.parse(localStorage.getItem(LOCAL_EXPERIENCES_KEY) || '{}');
  if (!all[userId]) all[userId] = [];
  const existingIdx = all[userId].findIndex(e => e.id === expId);
  if (existingIdx !== -1) {
    all[userId][existingIdx] = record;
  } else {
    all[userId].unshift(record);
  }
  localStorage.setItem(LOCAL_EXPERIENCES_KEY, JSON.stringify(all));
  return record;
};

/**
 * Delete an experience record
 */
export const deleteStudentExperience = async (userId, expId) => {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'experiences', expId);
      await deleteDoc(ref);
    } catch (e) {
      console.warn('Failed to delete experience from Firestore:', e);
    }
  }

  const all = JSON.parse(localStorage.getItem(LOCAL_EXPERIENCES_KEY) || '{}');
  if (all[userId]) {
    all[userId] = all[userId].filter(e => e.id !== expId);
    localStorage.setItem(LOCAL_EXPERIENCES_KEY, JSON.stringify(all));
  }
  return true;
};
