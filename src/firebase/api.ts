import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { User, Abonent, Payment, Tariffs, Notification } from '../../types';

// Users API
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  getUserByPin: async (pin: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('pin', '==', pin), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      console.error('Error getting user by PIN:', error);
      return null;
    }
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, userData);
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// Abonents API
export const abonentsApi = {
  getAbonents: async (): Promise<Abonent[]> => {
    try {
      const abonentsRef = collection(db, 'abonents');
      const snapshot = await getDocs(abonentsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Abonent));
    } catch (error) {
      console.error('Error getting abonents:', error);
      throw error;
    }
  },

  getAbonent: async (id: string): Promise<Abonent | null> => {
    try {
      const abonentRef = doc(db, 'abonents', id);
      const snapshot = await getDoc(abonentRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Abonent;
      }
      return null;
    } catch (error) {
      console.error('Error getting abonent:', error);
      throw error;
    }
  },

  createAbonent: async (abonentData: Omit<Abonent, 'id'>): Promise<Abonent> => {
    try {
      const abonentsRef = collection(db, 'abonents');
      const docRef = await addDoc(abonentsRef, abonentData);
      return { id: docRef.id, ...abonentData };
    } catch (error) {
      console.error('Error creating abonent:', error);
      throw error;
    }
  },

  updateAbonent: async (id: string, abonentData: Partial<Abonent>): Promise<void> => {
    try {
      const abonentRef = doc(db, 'abonents', id);
      await updateDoc(abonentRef, abonentData);
    } catch (error) {
      console.error('Error updating abonent:', error);
      throw error;
    }
  },

  deleteAbonent: async (id: string): Promise<void> => {
    try {
      const abonentRef = doc(db, 'abonents', id);
      await deleteDoc(abonentRef);
    } catch (error) {
      console.error('Error deleting abonent:', error);
      throw error;
    }
  }
};

// Payments API
export const paymentsApi = {
  getPayments: async (): Promise<Payment[]> => {
    try {
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  },

  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      const paymentsRef = collection(db, 'payments');
      const docRef = await addDoc(paymentsRef, paymentData);
      return { id: docRef.id, ...paymentData };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
};

// Tariffs API
export const tariffsApi = {
  getTariffs: async (): Promise<Tariffs[]> => {
    try {
      const tariffsRef = collection(db, 'tariffs');
      const snapshot = await getDocs(tariffsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tariffs));
    } catch (error) {
      console.error('Error getting tariffs:', error);
      throw error;
    }
  },

  updateTariffs: async (id: string, tariffsData: Partial<Tariffs>): Promise<void> => {
    try {
      const tariffsRef = doc(db, 'tariffs', id);
      await updateDoc(tariffsRef, tariffsData);
    } catch (error) {
      console.error('Error updating tariffs:', error);
      throw error;
    }
  }
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const snapshot = await getDocs(notificationsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  createNotification: async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...notificationData, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}; 