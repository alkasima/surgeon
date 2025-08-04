"use client";

import type { User, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { initializeUserData } from '@/app/user/actions';

interface AuthContextType {
  user: User | null;
  loading: boolean; 
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
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After successful Firebase Auth creation, initialize their user document in Firestore.
      if (userCredential.user) {
          await initializeUserData(userCredential.user.uid);
      }
      return userCredential.user;
    } catch (error) {
      const err = error as AuthError;
      setAuthError(err.message || 'Failed to sign up.');
      console.error("Sign up error:", err);
      return null;
    }
  };

  const logIn = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      const err = error as AuthError;
      setAuthError(err.message || 'Failed to log in.');
      console.error("Login error:", err);
      return null;
    }
  };

  const logOut = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      const err = error as AuthError;
      setAuthError(err.message || 'Failed to log out.');
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut, authError, setAuthError }}>
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
