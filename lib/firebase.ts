import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  connectAuthEmulator, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

// Connect to auth emulator in development (optional)
// if (process.env.NODE_ENV === "development" && !auth.emulatorConfig) {
//   connectAuthEmulator(auth, "http://localhost:9099");
// }

export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  'login_hint': 'user@example.com'
});

export { auth, firebaseConfig };

// Helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token for backend authentication
    const idToken = await user.getIdToken();
    
    return {
      user,
      idToken,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid
    };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw new Error(error.message || "Failed to sign in with Google");
  }
};

export const signOutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Sign Out Error:", error);
    throw new Error(error.message || "Failed to sign out");
  }
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export default auth;
