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
  User
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signInWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: orgName });
    await setDoc(doc(db, 'organizations', user.uid), {
      uid: user.uid,
      email: user.email,
      orgName,
      createdAt: new Date().toISOString()
    });
    return user;
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
}

export const authService = new AuthService(); 