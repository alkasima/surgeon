
"use client";

import type { User, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase'; // Added db
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Added for admin check
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean; // New isAdmin state
  signUp: (email: string, pass: string) => Promise<User | null>;
  logIn: (email: string, pass: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Initialize isAdmin
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check for admin status
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Note: New users won't be admins by default. Admin status is checked on login/auth state change.
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(authError.message || 'Failed to sign up.');
      console.error("Sign up error:", authError);
      return null;
    }
  };

  const logIn = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Admin status will be checked by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(authError.message || 'Failed to log in.');
      console.error("Login error:", authError);
      return null;
    }
  };

  const logOut = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setIsAdmin(false); // Reset admin status on logout
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(authError.message || 'Failed to log out.');
      console.error("Logout error:", authError);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, logIn, logOut, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
