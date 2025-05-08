import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: T
) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
    return docRef;
  } catch (error) {
    throw error;
  }
};

export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string
) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  } catch (error) {
    throw error;
  }
};

export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
  } catch (error) {
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
};

export const queryDocuments = async <T extends DocumentData>(
  collectionName: string,
  conditions: { field: string; operator: any; value: any }[],
  orderByField?: string,
  limitCount?: number
) => {
  try {
    let q = collection(db, collectionName);
    
    if (conditions.length > 0) {
      q = query(q, ...conditions.map(c => where(c.field, c.operator, c.value)));
    }
    
    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    throw error;
  }
}; 