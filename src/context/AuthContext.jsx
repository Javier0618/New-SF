import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const ADMIN_EMAIL = 'javiervelasquez0618@gmail.com';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync user doc from firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const initialData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || '',
            favorites: [],
            history: [],
            continueWatching: {},
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
        }

        // Subscribe to user doc updates
        const unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });

        setLoading(false);
        return () => unsubscribeUserDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(res.user, { displayName });
    }
    const userRef = doc(db, 'users', res.user.uid);
    await setDoc(userRef, {
      uid: res.user.uid,
      email,
      displayName: displayName || email.split('@')[0],
      favorites: [],
      history: [],
      continueWatching: {},
      createdAt: new Date().toISOString()
    });
    return res.user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserProfileData = async (data) => {
    if (!currentUser) return;
    if (data.displayName || data.photoURL) {
      await updateProfile(currentUser, {
        displayName: data.displayName || currentUser.displayName,
        photoURL: data.photoURL || currentUser.photoURL
      });
    }
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
  };

  const toggleFavorite = async (contentItem) => {
    if (!currentUser || !userData) throw new Error('Debes iniciar sesión para guardar favoritos');
    const userRef = doc(db, 'users', currentUser.uid);
    const existingFavs = userData.favorites || [];
    const isFav = existingFavs.some((item) => (typeof item === 'object' ? item.id === contentItem.id : item === contentItem.id));

    let updatedFavorites;
    if (isFav) {
      updatedFavorites = existingFavs.filter((item) => (typeof item === 'object' ? item.id !== contentItem.id : item !== contentItem.id));
    } else {
      updatedFavorites = [...existingFavs, contentItem];
    }

    await updateDoc(userRef, { favorites: updatedFavorites });
  };

  const addToHistory = async (contentItem) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const historyItem = {
      id: contentItem.id,
      title: contentItem.title || contentItem.name,
      poster_path: contentItem.poster_path || '',
      media_type: contentItem.media_type || 'movie',
      watchedAt: new Date().toISOString()
    };

    const existingHistory = userData?.history || [];
    const filteredHistory = existingHistory.filter((item) => item.id !== contentItem.id);
    const newHistory = [historyItem, ...filteredHistory].slice(0, 50); // limit 50

    await updateDoc(userRef, { history: newHistory });
  };

  const updateContinueWatching = async (contentId, progressData) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const continueWatching = { ...(userData?.continueWatching || {}) };

    if (progressData.progress >= 0.95) {
      delete continueWatching[contentId];
    } else {
      continueWatching[contentId] = {
        ...progressData,
        updatedAt: new Date().toISOString()
      };
    }

    await updateDoc(userRef, { continueWatching });
  };

  const removeFromContinueWatching = async (contentId) => {
    if (!currentUser || !userData) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const continueWatching = { ...(userData.continueWatching || {}) };
    delete continueWatching[contentId];
    await updateDoc(userRef, { continueWatching });
  };

  const isFavorite = (contentId) => {
    if (!userData?.favorites) return false;
    return userData.favorites.some((item) => (typeof item === 'object' ? item.id === contentId : item === contentId));
  };

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfileData,
    toggleFavorite,
    addToHistory,
    updateContinueWatching,
    removeFromContinueWatching,
    isFavorite
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
