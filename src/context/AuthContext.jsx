import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isFirebaseConfigured, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from '../config/firebase';
import { getUserProfile, saveUserProfile } from '../services/profileService';

const AuthContext = createContext(null);

const DEMO_USER = {
  uid: 'student_cloud_demo_01',
  email: 'student@ise.edu',
  displayName: 'Student Candidate',
  photoURL: null
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          const profile = await getUserProfile(user.uid, { email: user.email, displayName: user.displayName });
          setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
    } else {
      // In sandbox mode, require explicit sign in (session storage only, reset on fresh start)
      const savedUser = sessionStorage.getItem('skillvault_active_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          getUserProfile(parsed.uid, { email: parsed.email, displayName: parsed.displayName }).then(setUserProfile);
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(cred.user.uid, { email: cred.user.email, displayName: cred.user.displayName });
        setUserProfile(profile);
        return cred.user;
      } catch (err) {
        setAuthError(err.message);
        throw err;
      }
    } else {
      // Local simulated auth
      const userObj = {
        uid: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName: email.split('@')[0],
      };
      sessionStorage.setItem('skillvault_active_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      const profile = await getUserProfile(userObj.uid, { email: userObj.email, displayName: userObj.displayName });
      setUserProfile(profile);
      return userObj;
    }
  };

  const register = async (email, password, displayName) => {
    setAuthError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        const initialProfile = {
          fullName: displayName || email.split('@')[0],
          email,
          usn: '',
          institution: '',
          degree: '',
          semester: '',
          bio: '',
          skills: [],
          isPortfolioPublic: true
        };
        await saveUserProfile(cred.user.uid, initialProfile);
        setUserProfile(initialProfile);
        return cred.user;
      } catch (err) {
        setAuthError(err.message);
        throw err;
      }
    } else {
      const userObj = {
        uid: `user_${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
      };
      sessionStorage.setItem('skillvault_active_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      const initialProfile = {
        fullName: displayName || email.split('@')[0],
        email,
        usn: '',
        institution: '',
        degree: '',
        semester: '',
        bio: '',
        skills: [],
        isPortfolioPublic: true
      };
      await saveUserProfile(userObj.uid, initialProfile);
      setUserProfile(initialProfile);
      return userObj;
    }
  };

  const loginDemoStudent = async () => {
    setAuthError(null);
    sessionStorage.setItem('skillvault_active_session', JSON.stringify(DEMO_USER));
    setCurrentUser(DEMO_USER);
    const profile = await getUserProfile(DEMO_USER.uid);
    setUserProfile(profile);
    return DEMO_USER;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    sessionStorage.removeItem('skillvault_active_session');
    localStorage.removeItem('skillvault_demo_user');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid, { email: currentUser.email, displayName: currentUser.displayName });
      setUserProfile(profile);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    login,
    register,
    loginDemoStudent,
    logout,
    refreshProfile,
    isFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
