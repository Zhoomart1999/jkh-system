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
import { User, Abonent, Payment, Tariffs, Notification, TechnicalRequest, RequestType, RequestStatus, RequestPriority, BuildingType, WaterTariffType, Announcement, AbonentStatus, PaymentMethod, NotificationType, Role, ExpenseCategory } from '../../types';

// Реальный API для работы с Firebase
export const api = {
  // Abonents API
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

  updateAbonent: async (id: string, updateData: Partial<Abonent>): Promise<Abonent> => {
    try {
      const abonentRef = doc(db, 'abonents', id);
      await updateDoc(abonentRef, updateData);
      const updatedDoc = await getDoc(abonentRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Abonent;
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
  },

  // Users API
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

  // Payments API
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
  },

  updatePayment: async (id: string, updateData: Partial<Payment>): Promise<Payment> => {
    try {
      const paymentRef = doc(db, 'payments', id);
      await updateDoc(paymentRef, updateData);
      const updatedDoc = await getDoc(paymentRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  deletePayment: async (): Promise<void> => {
    // Placeholder for delete payment
    console.log('Delete payment not implemented');
  },

  // Tariffs API
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

  // Notifications API
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
  },

  // Technical Requests API
  getTechnicalRequests: async (): Promise<TechnicalRequest[]> => {
    try {
      const requestsRef = collection(db, 'technicalRequests');
      const snapshot = await getDocs(requestsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TechnicalRequest));
    } catch (error) {
      console.error('Error getting technical requests:', error);
      throw error;
    }
  },

  createTechnicalRequest: async (requestData: Omit<TechnicalRequest, 'id' | 'createdAt'>): Promise<TechnicalRequest> => {
    try {
      const requestsRef = collection(db, 'technicalRequests');
      const docRef = await addDoc(requestsRef, {
        ...requestData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...requestData, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error creating technical request:', error);
      throw error;
    }
  },

  updateTechnicalRequest: async (id: string, updateData: Partial<TechnicalRequest>): Promise<TechnicalRequest> => {
    try {
      const requestRef = doc(db, 'technicalRequests', id);
      await updateDoc(requestRef, updateData);
      const updatedDoc = await getDoc(requestRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as TechnicalRequest;
    } catch (error) {
      console.error('Error updating technical request:', error);
      throw error;
    }
  },

  // Check Closing API
  createCheckClosing: async (checkData: any): Promise<any> => {
    try {
      const checkClosingsRef = collection(db, 'checkClosings');
      const docRef = await addDoc(checkClosingsRef, {
        ...checkData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...checkData, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error creating check closing:', error);
      throw error;
    }
  },

  getCheckClosings: async (): Promise<any[]> => {
    try {
      const checkClosingsRef = collection(db, 'checkClosings');
      const snapshot = await getDocs(checkClosingsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting check closings:', error);
      throw error;
    }
  },

  // Placeholder methods for compatibility with mock API

  getReceiptDetails: async (abonentId: string): Promise<any> => {
    const abonent = await api.getAbonent(abonentId);
    if (!abonent) throw new Error('Абонент не найден');
    return {
      abonent,
      period: new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
      personalAccount: abonent.personalAccount,
      controllerName: abonent.controllerName || 'Контролер',
      companySettings: await api.getCompanySettings(),
      waterService: { charges: { name: 'Холодная вода', debt: Math.max(0, Math.abs(abonent.balance || 0)), accrued: 0, total: Math.max(0, Math.abs(abonent.balance || 0)) } },
      garbageService: { charges: { name: 'Стоки', debt: 0, accrued: 0, total: 0 } },
      totalToPay: Math.abs(abonent.balance || 0)
    };
  },
  logMassPrint: async (): Promise<void> => {
    console.log('Mass print logged');
  },

  logReceiptPrint: async (): Promise<void> => {
    console.log('Receipt print logged');
  },

  exportAbonentsToExcel: async (abonentsToExport: Abonent[]): Promise<void> => {
    console.log('Export to Excel:', abonentsToExport.length, 'abonents');
  },

  bulkUpdateAbonents: async (abonentIds: string[], updateData: Partial<Abonent>): Promise<void> => {
    for (const id of abonentIds) {
      await api.updateAbonent(id, updateData);
    }
  },

  bulkDeleteAbonents: async (abonentIds: string[]): Promise<void> => {
    for (const id of abonentIds) {
      await api.deleteAbonent(id);
    }
  },

  getControllers: async (): Promise<any[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', Role.Controller));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting controllers:', error);
      throw error;
    }
  },

  closeCheck: async (abonentId: string, amount: number): Promise<any> => {
    try {
      const abonent = await api.getAbonent(abonentId);
      if (!abonent) {
        throw new Error('Абонент не найден');
      }

      const updatedAbonent = await api.updateAbonent(abonentId, {
        balance: (abonent.balance || 0) + amount
      });

      return {
        success: true,
        abonent: updatedAbonent,
        closedAmount: amount
      };
    } catch (error) {
      console.error('Error closing check:', error);
      throw error;
    }
  },

  generatePersonalAccount: async (): Promise<string> => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `25${timestamp.slice(-6)}${random}`;
  },

  // Announcements API
  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const announcementsRef = collection(db, 'announcements');
      const snapshot = await getDocs(announcementsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  },

  createAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    try {
      const announcementsRef = collection(db, 'announcements');
      const docRef = await addDoc(announcementsRef, {
        ...announcementData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...announcementData, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Dashboard APIs
  getEngineerDashboardData: async (): Promise<any> => {
    try {
      const abonents = await api.getAbonents();
      const requests = await api.getTechnicalRequests();
      
      return {
        totalAbonents: abonents.length,
        activeAbonents: abonents.filter(a => a.status === AbonentStatus.Active).length,
        disconnectedAbonents: abonents.filter(a => a.status === AbonentStatus.Disconnected).length,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === RequestStatus.Pending).length,
        inProgressRequests: requests.filter(r => r.status === RequestStatus.InProgress).length,
        completedRequests: requests.filter(r => r.status === RequestStatus.Completed).length,
        totalDebt: abonents.reduce((sum, a) => sum + Math.abs(a.balance), 0),
        recentRequests: requests.slice(0, 5),
        abonentStatusDistribution: [
          { name: 'Активные', value: abonents.filter(a => a.status === AbonentStatus.Active).length },
          { name: 'Отключенные', value: abonents.filter(a => a.status === AbonentStatus.Disconnected).length },
          { name: 'Архивные', value: abonents.filter(a => a.status === AbonentStatus.Archived).length }
        ]
      };
    } catch (error) {
      console.error('Error getting engineer dashboard data:', error);
      throw error;
    }
  },

  getAccountantDashboardData: async (): Promise<any> => {
    try {
      const abonents = await api.getAbonents();
      const payments = await api.getPayments();
      
      return {
        totalAbonents: abonents.length,
        totalDebt: abonents.reduce((sum, a) => sum + Math.abs(a.balance), 0),
        paymentsToday: payments.filter(p => {
          const today = new Date().toDateString();
          const paymentDate = new Date(p.date).toDateString();
          return today === paymentDate;
        }).length,
        totalPaidThisMonth: payments.reduce((sum, p) => sum + p.amount, 0),
        recentPayments: payments.slice(0, 5),
        debtDistribution: [
          { name: '0-1000 сом', value: abonents.filter(a => Math.abs(a.balance) <= 1000).length },
          { name: '1000-5000 сом', value: abonents.filter(a => Math.abs(a.balance) > 1000 && Math.abs(a.balance) <= 5000).length },
          { name: '5000+ сом', value: abonents.filter(a => Math.abs(a.balance) > 5000).length }
        ]
      };
    } catch (error) {
      console.error('Error getting accountant dashboard data:', error);
      throw error;
    }
  },

  getAdminDashboardData: async (): Promise<any> => {
    try {
      const users = await api.getUsers();
      const abonents = await api.getAbonents();
      const announcements = await api.getAnnouncements();
      
      return {
        totalUsers: users.length,
        totalAbonents: abonents.length,
        totalAnnouncements: announcements.length,
        activeAnnouncements: announcements.filter(a => a.isActive).length,
        userRoleDistribution: [
          { name: 'Админы', value: users.filter(u => u.role === Role.Admin).length },
          { name: 'Инженеры', value: users.filter(u => u.role === Role.Engineer).length },
          { name: 'Бухгалтеры', value: users.filter(u => u.role === Role.Accountant).length },
          { name: 'Контролеры', value: users.filter(u => u.role === Role.Controller).length }
        ],
        recentUsers: users.slice(0, 5),
        recentAnnouncements: announcements.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting admin dashboard data:', error);
      throw error;
    }
  },

  // Placeholder methods for all other API calls
  confirmCheckClosing: async (id: string): Promise<void> => {
    console.log(`Check closing ${id} confirmed`);
  },

  cancelCheckClosing: async (id: string): Promise<void> => {
    console.log(`Check closing ${id} cancelled`);
  },

  abonentLogin: async (personalAccount: string, password: string): Promise<Abonent | null> => {
    try {
      const abonents = await api.getAbonents();
      return abonents.find(a => a.personalAccount === personalAccount) || null;
    } catch (error) {
      console.error('Error in abonent login:', error);
      return null;
    }
  },

  // Add all other missing methods as placeholders
  getStaffSalaries: async (): Promise<any[]> => { return []; },
  updateFinancialPlan: async (id: string, data: any): Promise<any> => { return { id, ...data }; },
  addFinancialPlan: async (data: any): Promise<any> => { return { id: Date.now().toString(), ...data }; },
  deleteFinancialPlan: async (id: string): Promise<void> => { console.log(`Financial plan ${id} deleted`); },
  updateDebtCase: async (id: string, data: any): Promise<any> => { return { id, ...data }; },
  deleteExpense: async (id: string): Promise<void> => { console.log(`Expense ${id} deleted`); },
  updateFuelLog: async (id: string, data: any): Promise<any> => { return { id, ...data }; },
  addFuelLog: async (data: any): Promise<any> => { return { id: Date.now().toString(), ...data }; },
  deleteFuelLog: async (id: string): Promise<void> => { console.log(`Fuel log ${id} deleted`); },
  deleteManualCharge: async (id: string): Promise<void> => { console.log(`Manual charge ${id} deleted`); },
  reconcilePayments: async (paymentIds: string[], transactionIds: string[]): Promise<any> => { return { success: true, reconciled: paymentIds.length }; },
  addPayment: async (paymentData: any, abonentId: string): Promise<Payment> => { return await api.createPayment({ ...paymentData, abonentId, status: 'completed' }); },
  getAbonentPaymentHistory: async (abonentId: string): Promise<Payment[]> => { 
    const payments = await api.getPayments();
    return payments.filter(p => p.abonentId === abonentId);
  },
  generatePaymentQRCode: async (amount: number, abonentId: string): Promise<string> => { return `QR_CODE_${amount}_${abonentId}`; },
  getPaymentsForCheckClosing: async (): Promise<any[]> => { return await api.getPayments(); },
  exportCheckClosingReport: async (checkClosingId: string): Promise<void> => { console.log(`Exporting check closing report for ${checkClosingId}`); },
  getInfrastructureZones: async (): Promise<any[]> => { return []; },
  addInfrastructureZone: async (name: string): Promise<any> => { return { id: Date.now().toString(), name }; },
  getInventory: async (): Promise<any[]> => { return []; },
  updateInventoryItem: async (id: string, data: any): Promise<any> => { return { id, ...data }; },
  addInventoryItem: async (data: any): Promise<any> => { return { id: Date.now().toString(), ...data }; },
  getMaintenanceTasks: async (): Promise<any[]> => { return []; },
  updateMaintenanceTask: async (id: string, data: any): Promise<any> => { return { id, ...data }; },
  addWaterQualitySample: async (data: any): Promise<any> => { return { id: Date.now().toString(), ...data }; },
  getWaterQualitySamples: async (): Promise<any[]> => { return []; },
  generateMonthlyAccruals: async (month: string, year: string): Promise<any> => { return { success: true, generated: 150 }; },
  getAbonentHistory: async (abonentId: string): Promise<any[]> => { return []; },
  getAbonentPortalData: async (abonentId: string): Promise<any> => { 
    const abonent = await api.getAbonent(abonentId);
    const history = await api.getAbonentHistory(abonentId);
    return { abonent, history };
  },
  addMeterReadingByAbonent: async (abonentId: string, reading: number): Promise<any> => { return { id: Date.now().toString(), abonentId, reading, date: new Date().toISOString() }; },
  updateUser: async (id: string, data: any): Promise<User> => { 
    const users = await api.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Пользователь не найден');
    return { ...user, ...data };
  },
  createUser: async (data: any): Promise<User> => { return { id: Date.now().toString(), ...data, isActive: true }; },
  updateTariffs: async (id: string, data: any): Promise<void> => { console.log(`Tariffs ${id} updated`); },
  getCompanySettings: async (): Promise<any> => { 
    return {
      name: 'МП "ЧУЙ ВОДОКАНАЛ"',
      address: 'г. Токмок, ул. Ленина 1',
      phone: '6-69-37, 0559909143',
      instagram: 'mp_tokmokvodokanal',
      receiptTemplate: 'tokmok'
    };
  },
  updateCompanySettings: async (data: any): Promise<void> => { console.log('Company settings updated'); },
  updateAnnouncement: async (id: string, data: any): Promise<Announcement> => { return { id, ...data, createdAt: new Date().toISOString() }; },
  addAnnouncement: async (data: any): Promise<Announcement> => { return await api.createAnnouncement(data); },
  deleteAnnouncement: async (id: string): Promise<void> => { console.log(`Announcement ${id} deleted`); },
  getNotificationTemplates: async (): Promise<any[]> => { return []; },
  getNotificationCampaigns: async (): Promise<any[]> => { return []; },
  getDebtRestructuringPlans: async (): Promise<any[]> => { return []; },
  markNotificationAsRead: async (id: string): Promise<void> => { console.log(`Notification ${id} marked as read`); }
};
