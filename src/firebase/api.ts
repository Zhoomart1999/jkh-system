import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { User, Role, Abonent, Payment, Tariffs, Notification } from '../../types';

// API для пользователей
export const usersApi = {
  // Получить всех пользователей
  getUsers: async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Найти пользователя по PIN
  getUserByPin: async (pin: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('pin', '==', pin), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as User;
    } catch (error) {
      console.error('Error getting user by PIN:', error);
      throw error;
    }
  },

  // Создать пользователя
  createUser: async (userData: Omit<User, 'id'>): Promise<string> => {
    try {
      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, userData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Обновить пользователя
  updateUser: async (id: string, userData: Partial<User>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Удалить пользователя
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

// API для абонентов
export const abonentsApi = {
  // Получить всех абонентов
  getAbonents: async (): Promise<Abonent[]> => {
    try {
      const abonentsRef = collection(db, 'abonents');
      const q = query(abonentsRef, orderBy('fullName'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Abonent[];
    } catch (error) {
      console.error('Error getting abonents:', error);
      throw error;
    }
  },

  // Получить абонента по ID
  getAbonent: async (id: string): Promise<Abonent | null> => {
    try {
      const abonentRef = doc(db, 'abonents', id);
      const docSnap = await getDoc(abonentRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Abonent;
      }
      return null;
    } catch (error) {
      console.error('Error getting abonent:', error);
      throw error;
    }
  },

  // Создать абонента
  createAbonent: async (abonentData: Omit<Abonent, 'id'>): Promise<string> => {
    try {
      const abonentsRef = collection(db, 'abonents');
      
      // Фильтруем undefined значения для Firestore
      const cleanData = Object.fromEntries(
        Object.entries(abonentData).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(abonentsRef, cleanData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating abonent:', error);
      throw error;
    }
  },

  // Обновить абонента
  updateAbonent: async (id: string, abonentData: Partial<Abonent>): Promise<void> => {
    try {
      const abonentRef = doc(db, 'abonents', id);
      
      // Фильтруем undefined значения для Firestore
      const cleanData = Object.fromEntries(
        Object.entries(abonentData).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(abonentRef, cleanData);
    } catch (error) {
      console.error('Error updating abonent:', error);
      throw error;
    }
  },

  // Удалить абонента
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

// API для платежей
export const paymentsApi = {
  // Получить все платежи
  getPayments: async (): Promise<Payment[]> => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  },

  // Создать платеж
  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<string> => {
    try {
      const paymentsRef = collection(db, 'payments');
      const docRef = await addDoc(paymentsRef, paymentData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
};

// API для тарифов
export const tariffsApi = {
  // Получить тарифы
  getTariffs: async (): Promise<Tariffs | null> => {
    try {
      const tariffsRef = collection(db, 'tariffs');
      const q = query(tariffsRef, orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as unknown as Tariffs;
    } catch (error) {
      console.error('Error getting tariffs:', error);
      throw error;
    }
  },

  // Обновить тарифы
  updateTariffs: async (tariffs: Partial<Tariffs>): Promise<void> => {
    try {
      const tariffsRef = collection(db, 'tariffs');
      await addDoc(tariffsRef, {
        ...tariffs,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating tariffs:', error);
      throw error;
    }
  }
};

// API для уведомлений
export const notificationsApi = {
  // Получить все уведомления
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Создать уведомление
  createNotification: async (notificationData: Omit<Notification, 'id'>): Promise<string> => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}; 