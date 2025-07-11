
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

type UserRole = 'consumer' | 'store-owner' | 'delivery-person';

interface User {
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
    
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              role: userData?.role || null,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Gracefully handle offline case or other errors by setting user without role
            // We don't toast here as it could fire on every page load if DB is offline
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                role: null, 
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    if (!auth || !db) {
      throw new Error("Firebase is not configured. Please add your project credentials to the .env file and restart the development server.");
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Perform updates in parallel for speed and await their completion
        await Promise.all([
          updateProfile(firebaseUser, { displayName: name }),
          setDoc(doc(db, "users", firebaseUser.uid), {
              uid: firebaseUser.uid,
              name,
              email,
              role,
              createdAt: serverTimestamp()
          })
        ]);
        
        // Manually update the local user state to avoid race conditions with onAuthStateChanged
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          role: role,
        });

        toast({
            title: "Account Created!",
            description: "Welcome to Quickart!",
        });

    } catch (error: any) {
        console.error("Signup failed:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error.code) {
            switch(error.code) {
                // --- Auth Errors ---
                case 'auth/invalid-api-key':
                    errorMessage = 'Invalid Firebase API Key. Please check your .env file and restart the server.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. Please choose a stronger one.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/Password sign-up is not enabled in your Firebase project.';
                    break;
                
                // --- Firestore Errors ---
                case 'not-found':
                    errorMessage = 'Failed to save user profile. The Firestore database may not be set up. Please create it in your Firebase project console.';
                    break;
                case 'permission-denied':
                    errorMessage = 'Failed to save user profile due to database security rules. Please check your Firestore rules in the Firebase console.';
                    break;

                default:
                    errorMessage = `Failed to create an account. Please check your Firebase setup. (Error: ${error.code})`;
                    break;
            }
        }
        throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth || !db) {
      throw new Error("Firebase is not configured. Please add your project credentials to the .env file and restart the development server.");
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: `Welcome back, ${userCredential.user.displayName || 'User'}!`,
        });
    } catch (error: any) {
        console.error("Login failed:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-api-key':
                    errorMessage = 'Invalid Firebase API Key. Please check your .env file and restart the server.';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/Password sign-in is not enabled in your Firebase project.';
                    break;
                default:
                    errorMessage = 'Failed to log in. Please check your Firebase setup and try again.';
                    break;
            }
        }
        throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    if (!auth) {
        toast({
            title: "Error",
            description: "Firebase is not configured.",
            variant: "destructive",
          });
        return;
    }
    await signOut(auth);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
