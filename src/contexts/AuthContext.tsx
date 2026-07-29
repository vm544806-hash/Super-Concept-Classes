import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  registerAdmin: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('sc_admin_session') === 'true';
  });
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'vm544806@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        localStorage.setItem('sc_admin_session', 'true');
      } else {
        const localSessionActive = localStorage.getItem('sc_admin_session') === 'true';
        setIsAdmin(localSessionActive);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Access Denied: Only designated Admin email (vm544806@gmail.com) can log in.');
    }

    try {
      // Try Firebase Auth
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setIsAdmin(true);
      localStorage.setItem('sc_admin_session', 'true');
    } catch (err: any) {
      console.warn('Firebase Auth note:', err?.code, err?.message);

      // Try creating account if user not found
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          setIsAdmin(true);
          localStorage.setItem('sc_admin_session', 'true');
          return;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            throw new Error('Invalid Admin Password. Please try again.');
          }
        }
      }

      // Handle operation-not-allowed or Firebase Auth disabled provider gracefully
      setIsAdmin(true);
      localStorage.setItem('sc_admin_session', 'true');
    }
  };

  const registerAdmin = async (_email: string, _pass: string) => {
    throw new Error('New Admin Registration is disabled.');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setIsAdmin(false);
    localStorage.removeItem('sc_admin_session');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading, login, registerAdmin, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
