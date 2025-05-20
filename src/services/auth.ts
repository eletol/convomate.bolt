import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  User,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import app from '../config/firebase';

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

class AuthService {
  // Email/Password Auth
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);      const user = userCredential.user;

      // Reload user to get latest emailVerified status
      await reload(user);

      if (!user.emailVerified) {
        // Sign out the user if email is not verified
        await signOut(auth);
        throw new Error('Please check your email for the verification link to complete your registration.');
      }

      return user;
    } catch (error: any) {
      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.');
        default:
          throw new Error(error.message || 'An error occurred during sign in.');
      }
    }
  }

  async signInWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if organization exists
      const orgRef = doc(db, 'organizations', user.uid);
      const orgSnap = await getDoc(orgRef);
      if (!orgSnap.exists()) {
        await setDoc(orgRef, {
          uid: user.uid,
          email: user.email,
          orgName: user.displayName || '',
          createdAt: new Date().toISOString(),
          emailVerified: user.emailVerified,
          plan: 'basic',
          usage: {
            agents: 0,
            messages: 0,
            storage_gb: 0
          }
        });
      }

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async registerWithEmail(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Email/Password Auth
  async signUpWithEmail(email: string, password: string, orgName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
      
      // Update profile
      await updateProfile(user, { displayName: orgName });

      // Check if organization exists
      const orgRef = doc(db, 'organizations', user.uid);
      const orgSnap = await getDoc(orgRef);
      if (!orgSnap.exists()) {
        await setDoc(orgRef, {
          uid: user.uid,
          email: user.email,
          orgName,
          createdAt: new Date().toISOString(),
          emailVerified: false,
          plan: 'basic',
          usage: {
            agents: 0,
            messages: 0,
            storage_gb: 0
          }
        });
      }
      
      return user;
    } catch (error: any) {
      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered. Please sign in instead.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled. Please contact support.');
        case 'auth/weak-password':
          throw new Error('Please choose a stronger password.');
        default:
          throw new Error('An error occurred during registration. Please try again.');
      }
    }
  }

  // Password Management
  async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async updatePassword(user: User, newPassword: string) {
    return updatePassword(user, newPassword);
  }

  // Organization Management
  async getOrgInfo(uid: string) {
    const docRef = doc(db, 'organizations', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async updateOrgInfo(uid: string, data: any) {
    const docRef = doc(db, 'organizations', uid);
    return setDoc(docRef, data, { merge: true });
  }

  async resendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in.');
      }
      
      if (user.emailVerified) {
        throw new Error('Email is already verified.');
      }

      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`, // Redirect back to login after verification
        handleCodeInApp: false // Use the default Firebase verification page
      });
      
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email.');
    }
  }
}

export const authService = new AuthService(); 