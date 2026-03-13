"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, signInWithGoogle, signOutGoogle } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  provider: "google" | "email" | "local";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  loginAsGuest: (name: string) => void;
  logout: () => void;
  isLoading: boolean;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// Helper to build user object from Firebase user
const buildUserFromFirebase = (firebaseUser: any): User => {
  const names = (firebaseUser.displayName || "").split(" ");
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    firstName: names[0] || "User",
    lastName: names.slice(1).join(" ") || "",
    avatar: firebaseUser.photoURL || undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isActive: true,
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    provider: "google",
  };
};

// Helper to build user object for guest/local users
const buildLocalUser = (name: string, email?: string): User => {
  const names = name.trim().split(" ");
  return {
    id: `local_${Date.now()}`,
    email: email || "",
    firstName: names[0] || "Guest",
    lastName: names.slice(1).join(" ") || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    provider: "local",
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen for Firebase auth state changes + check localStorage fallback
  useEffect(() => {
    // First, check for a locally saved user (offline-first)
    const savedUser = localStorage.getItem("zenith_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // corrupt data
      }
    }

    // Then listen for Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser = buildUserFromFirebase(firebaseUser);
        setUser(appUser);
        localStorage.setItem("zenith_user", JSON.stringify(appUser));
        localStorage.setItem("zenith_offline_profile", JSON.stringify(appUser));
      }
      setIsLoading(false);
    });

    // If Firebase takes too long, stop loading after 2s
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Clear all local auth data
  const clearAuth = () => {
    localStorage.removeItem("zenith_user");
    localStorage.removeItem("zenith_offline_profile");
    localStorage.removeItem("zenith_access_token");
    localStorage.removeItem("zenith_refresh_token");
    setUser(null);
  };

  // Email/Password Login — works locally (demo mode)
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Demo account support
      if (email === "demo@zenith.com" && password === "demo123") {
        const demoUser: User = {
          id: "demo_user",
          email: "demo@zenith.com",
          firstName: "Demo",
          lastName: "User",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          provider: "local",
        };
        setUser(demoUser);
        localStorage.setItem("zenith_user", JSON.stringify(demoUser));
        return true;
      }

      // Check localStorage for local accounts
      const localAccounts = JSON.parse(
        localStorage.getItem("zenith_local_accounts") || "[]"
      );
      const account = localAccounts.find(
        (a: any) => a.email === email && a.password === password
      );
      if (account) {
        const localUser = buildLocalUser(
          `${account.firstName} ${account.lastName}`,
          email
        );
        localUser.id = account.id;
        localUser.firstName = account.firstName;
        localUser.lastName = account.lastName;
        localUser.createdAt = account.createdAt;
        setUser(localUser);
        localStorage.setItem("zenith_user", JSON.stringify(localUser));
        return true;
      }

      throw new Error("Invalid email or password. Try the demo account or create a new account.");
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Signup — stores locally, syncs when online
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const names = name.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || firstName;

      // Store account locally
      const localAccounts = JSON.parse(
        localStorage.getItem("zenith_local_accounts") || "[]"
      );

      // Check if email already exists
      if (localAccounts.some((a: any) => a.email === email)) {
        throw new Error("An account with this email already exists.");
      }

      const newAccount = {
        id: `local_${Date.now()}`,
        email,
        password, // Note: In production, this should be hashed
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
      };

      localAccounts.push(newAccount);
      localStorage.setItem(
        "zenith_local_accounts",
        JSON.stringify(localAccounts)
      );

      // Auto-login the new user
      const newUser = buildLocalUser(name, email);
      newUser.id = newAccount.id;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      setUser(newUser);
      localStorage.setItem("zenith_user", JSON.stringify(newUser));
      localStorage.setItem("zenith_offline_profile", JSON.stringify(newUser));

      return true;
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login — Firebase-only, no backend needed
  const googleLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const firebaseData = await signInWithGoogle();
      const appUser = buildUserFromFirebase(firebaseData.user);
      setUser(appUser);
      localStorage.setItem("zenith_user", JSON.stringify(appUser));
      localStorage.setItem("zenith_offline_profile", JSON.stringify(appUser));
      return true;
    } catch (err: any) {
      await signOutGoogle().catch(() => {});
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Guest / local-only login
  const loginAsGuest = (name: string) => {
    const guestUser = buildLocalUser(name || "Guest");
    guestUser.provider = "local";
    setUser(guestUser);
    localStorage.setItem("zenith_user", JSON.stringify(guestUser));
  };

  // Logout
  const logout = () => {
    signOutGoogle().catch(() => {});
    clearAuth();
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    googleLogin,
    loginAsGuest,
    logout,
    isLoading,
    isOnline,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
