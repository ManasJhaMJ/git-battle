import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');

const GitHubAuth = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [githubUsername, setGithubUsername] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in
        const token = await authUser.getIdToken();
        
        // Get GitHub username from token or API - now using await
        const username = await getGithubUsernameFromToken(authUser);
        setGithubUsername(username);
        
        // Initialize or update user in database
        initUserInDatabase(authUser.uid, username);
        
        setUser(authUser);
      } else {
        // User is signed out
        setUser(null);
        setGithubUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getGithubUsernameFromToken = async (authUser) => {
    try {
      // Check if we can get the username from providerData
      const githubUser = authUser.providerData.find(
        provider => provider.providerId === 'github.com'
      );
      
      // First try to get it from reloadUserInfo if available
      if (authUser.reloadUserInfo && authUser.reloadUserInfo.screenName) {
        return authUser.reloadUserInfo.screenName;
      }
      
      // If not available in reloadUserInfo, try to get the token and fetch from GitHub API
      const credential = GithubAuthProvider.credentialFromResult(authUser);
      if (credential && credential.accessToken) {
        const token = credential.accessToken;
        
        // Use the token to fetch the user info from GitHub API
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          return userData.login; // This is the GitHub username
        }
      }
      
      // If we still don't have the username, try to extract from additional info or use a fallback
      return githubUser ? 
        // Try to get username from additional provider data or use uid as fallback
        (githubUser.username || githubUser.uid) 
        : null;
    } catch (error) {
      console.error("Error getting GitHub username:", error);
      return null;
    }
  };

  const initUserInDatabase = async (uid, username) => {
    try {
      // Check if user exists in database
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // If user doesn't exist, create a new entry
        await set(userRef, {
          githubUsername: username,
          battles: {
            wins: 0,
            losses: 0,
            total: 0
          },
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error initializing user in database:", error);
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <GitHubAuthContext.Provider 
      value={{ user, githubUsername, loading, login, logout }}
    >
      {children}
    </GitHubAuthContext.Provider>
  );
};

// Create Context
export const GitHubAuthContext = React.createContext(null);

// Hook for using auth
export const useGitHubAuth = () => {
  const context = React.useContext(GitHubAuthContext);
  if (!context) {
    throw new Error("useGitHubAuth must be used within a GitHubAuthProvider");
  }
  return context;
};

export default GitHubAuth;