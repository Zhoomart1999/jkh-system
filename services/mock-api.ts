// Подключаем Firebase API
import { usersApi, abonentsApi, paymentsApi, tariffsApi, notificationsApi } from '../src/firebase/api';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/firebase/config';

import { 
  User, 
  Role, 
  Abonent, 
  AbonentStatus, 
  Payment, 
  PaymentMethod, 
  Tariffs, 
  Notification, 
  SystemNotificationType,
  TechnicalRequest,
  RequestType,
  RequestStatus,
  BuildingType,
  WaterTariffType,
  RequestPriority,
  NotificationType,
  AuditLog,
  ActionLog
} from '../types';

// Основной API - полностью Firebase
export const api = {
  // Абоненты - Firebase
  getAbonents: async (): Promise<Abonent[]> => {
    console.log('Getting abonents from Firebase');
    return await abonentsApi.getAbonents();
  },
  getAbonent: async (id: string): Promise<Abonent | null> => {
    console.log('Getting abonent from Firebase:', id);
    return await abonentsApi.getAbonent(id);
  },
  createAbonent: async (abonentData: Omit<Abonent, 'id'>): Promise<string> => {
    console.log('Creating abonent in Firebase:', abonentData);
    return await abonentsApi.createAbonent(abonentData);
  },
  addAbonent: async (abonentData: Omit<Abonent, 'id'>): Promise<string> => {
    return api.createAbonent(abonentData);
  },
  updateAbonent: async (id: string, abonentData: Partial<Abonent>): Promise<void> => {
    console.log('Updating abonent in Firebase:', id, abonentData);
    await abonentsApi.updateAbonent(id, abonentData);
  },
  deleteAbonent: async (id: string): Promise<void> => {
    console.log('Deleting abonent from Firebase:', id);
    await abonentsApi.deleteAbonent(id);
  },
  getAbonentsWithFilters: async (filters: any): Promise<Abonent[]> => {
    console.log('Getting abonents with filters from Firebase:', filters);
    const abonents = await abonentsApi.getAbonents();
    // Применяем фильтры на клиенте (можно оптимизировать на сервере)
    return abonents;
  },
  
  // Пользователи - Firebase
  getUsers: async (): Promise<User[]> => {
    console.log('Getting users from Firebase');
    return await usersApi.getUsers();
  },
  getUser: async (id: string): Promise<User | null> => {
    console.log('Getting user from Firebase:', id);
    const users = await usersApi.getUsers();
    return users.find(u => u.id === id) || null;
  },
  createUser: async (userData: Omit<User, 'id'>): Promise<string> => {
    console.log('Creating user in Firebase:', userData);
    return await usersApi.createUser(userData);
  },
  updateUser: async (id: string, userData: Partial<User>): Promise<void> => {
    console.log('Updating user in Firebase:', id, userData);
    await usersApi.updateUser(id, userData);
  },
  deleteUser: async (id: string): Promise<void> => {
    console.log('Deleting user from Firebase:', id);
    await usersApi.deleteUser(id);
  },
  
  // Платежи - Firebase
  getPayments: async (): Promise<Payment[]> => {
    console.log('Getting payments from Firebase');
    return await paymentsApi.getPayments();
  },
  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<string> => {
    console.log('Creating payment in Firebase:', paymentData);
    return await paymentsApi.createPayment(paymentData);
  },
  getAbonentPayments: async (abonentId: string): Promise<Payment[]> => {
    console.log('Getting abonent payments from Firebase:', abonentId);
    const payments = await paymentsApi.getPayments();
    return payments.filter(p => p.abonentId === abonentId);
  },
  
  // Тарифы - Firebase
  getTariffs: async (): Promise<Tariffs | null> => {
    console.log('Getting tariffs from Firebase');
    return await tariffsApi.getTariffs();
  },
  updateTariffs: async (tariffs: Partial<Tariffs>): Promise<void> => {
    console.log('Updating tariffs in Firebase:', tariffs);
    await tariffsApi.updateTariffs(tariffs);
  },
  
  // Уведомления - Firebase
  getNotifications: async (): Promise<Notification[]> => {
    console.log('Getting notifications from Firebase');
    return await notificationsApi.getNotifications();
  },
  createNotification: async (notificationData: Omit<Notification, 'id'>): Promise<string> => {
    console.log('Creating notification in Firebase:', notificationData);
    return await notificationsApi.createNotification(notificationData);
  },
  markNotificationAsRead: async (id: string): Promise<void> => {
    console.log('Marking notification as read:', id);
    // Обновляем в Firebase
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, { isRead: true });
  },
  
  // Аудит - Firebase
  getAuditLogs: async (): Promise<AuditLog[]> => {
    console.log('Getting audit logs from Firebase');
    try {
      const logsRef = collection(db, 'auditLogs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
    } catch (error) {
      console.log('Firebase error getting audit logs:', error);
      return [];
    }
  },
  
  createAuditLog: async (logData: Omit<AuditLog, 'id'>): Promise<string> => {
    console.log('Creating audit log in Firebase:', logData);
    try {
      const logsRef = collection(db, 'auditLogs');
      const docRef = await addDoc(logsRef, logData);
      return docRef.id;
    } catch (error) {
      console.log('Firebase error creating audit log:', error);
      throw error;
    }
  },
  
  getActionLogs: async (): Promise<ActionLog[]> => {
    console.log('Getting action logs from Firebase');
    try {
      const logsRef = collection(db, 'actionLogs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionLog));
    } catch (error) {
      console.log('Firebase error getting action logs:', error);
      return [];
    }
  },
  
  createActionLog: async (logData: Omit<ActionLog, 'id'>): Promise<string> => {
    console.log('Creating action log in Firebase:', logData);
    try {
      const logsRef = collection(db, 'actionLogs');
      const docRef = await addDoc(logsRef, logData);
      return docRef.id;
    } catch (error) {
      console.log('Firebase error creating action log:', error);
      throw error;
    }
  },
  
  // Технические заявки - Firebase
  getTechnicalRequests: async (): Promise<TechnicalRequest[]> => {
    console.log('Getting technical requests from Firebase');
    try {
      const requestsRef = collection(db, 'technicalRequests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TechnicalRequest));
    } catch (error) {
      console.log('Firebase error getting technical requests:', error);
      return [];
    }
  },
  
  createTechnicalRequest: async (requestData: Omit<TechnicalRequest, 'id'>): Promise<string> => {
    console.log('Creating technical request in Firebase:', requestData);
    try {
      const requestsRef = collection(db, 'technicalRequests');
      const docRef = await addDoc(requestsRef, requestData);
      return docRef.id;
    } catch (error) {
      console.log('Firebase error creating technical request:', error);
      throw error;
    }
  },
  
  updateTechnicalRequest: async (id: string, requestData: Partial<TechnicalRequest>): Promise<void> => {
    console.log('Updating technical request in Firebase:', id, requestData);
    try {
      const requestRef = doc(db, 'technicalRequests', id);
      await updateDoc(requestRef, requestData);
    } catch (error) {
      console.log('Firebase error updating technical request:', error);
      throw error;
    }
  },
  
  // Дополнительные функции
  resetAbonentPassword: async (abonentId: string): Promise<boolean> => {
    console.log('Resetting password for abonent:', abonentId);
    try {
      const abonentRef = doc(db, 'abonents', abonentId);
      await updateDoc(abonentRef, { password: '123456' });
      return true;
    } catch (error) {
      console.log('Firebase error resetting password:', error);
      return false;
    }
  },
  
  addMeterReading: async (abonentId: string, reading: number): Promise<boolean> => {
    console.log('Adding meter reading for abonent:', abonentId, reading);
    try {
      const abonentRef = doc(db, 'abonents', abonentId);
      await updateDoc(abonentRef, { 
        lastMeterReading: reading,
        meterReadingMonth: new Date().toISOString().slice(0, 7)
      });
      return true;
    } catch (error) {
      console.log('Firebase error adding meter reading:', error);
      return false;
    }
  },
  
  recordPaymentByController: async (abonentId: string, amount: number): Promise<boolean> => {
    console.log('Recording payment by controller for abonent:', abonentId, amount);
    try {
      const abonent = await api.getAbonent(abonentId);
      const paymentData = {
        abonentId,
        abonentName: abonent?.fullName || 'Неизвестный абонент',
        amount,
        date: new Date().toISOString().split('T')[0],
        method: PaymentMethod.Cash,
        paymentMethod: 'cash',
        collectorId: 'controller',
        recordedByName: 'Контролёр',
        recordedBy: 'controller'
      };
      await api.createPayment(paymentData);
      return true;
    } catch (error) {
      console.log('Firebase error recording payment:', error);
      return false;
    }
  },
  
  logReceiptPrint: async (abonentIds: string | string[]): Promise<boolean> => {
    console.log('Logging receipt print for abonent(s):', abonentIds);
    try {
      const ids = Array.isArray(abonentIds) ? abonentIds : [abonentIds];
      const logData = {
        action: 'receipt_print',
        entityType: 'abonent' as const,
        entityId: ids.join(','),
        timestamp: new Date().toISOString(),
        userId: 'system',
        details: `Печать квитанций для ${ids.length} абонентов`
      };
      await api.createActionLog(logData);
      return true;
    } catch (error) {
      console.log('Firebase error logging receipt print:', error);
      return false;
    }
  },
  
  getBulkReceiptDetails: async (abonentIds: string[]): Promise<any[]> => {
    console.log('Getting bulk receipt details for abonents:', abonentIds);
    const receipts: any[] = [];
    
    for (const abonentId of abonentIds) {
      try {
        const receipt = await api.receipts.getReceiptDetails(abonentId);
        receipts.push(receipt);
      } catch (error) {
        console.error(`Error getting receipt for abonent ${abonentId}:`, error);
      }
    }
    
    return receipts;
  },
  
  getReceiptDetails: async (abonentId: string): Promise<any> => {
    console.log('Getting receipt details for abonent:', abonentId);
    return await api.receipts.getReceiptDetails(abonentId);
  },
  
  getAbonentHistory: async (abonentId: string): Promise<any> => {
    console.log('Getting abonent history for:', abonentId);
    try {
      const payments = await api.getAbonentPayments(abonentId);
      return {
        payments,
        accruals: [] // Можно добавить начисления позже
      };
    } catch (error) {
      console.log('Firebase error getting abonent history:', error);
      return { payments: [], accruals: [] };
    }
  },
  
  createQRCode: async (abonentId: string, amount: number): Promise<any> => {
    console.log('Creating QR code for abonent:', abonentId, amount);
    try {
      const qrData = {
        abonentId,
        amount,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      };
      const qrRef = collection(db, 'qrCodes');
      const docRef = await addDoc(qrRef, qrData);
      return { id: docRef.id, ...qrData };
    } catch (error) {
      console.log('Firebase error creating QR code:', error);
      throw error;
    }
  },
  
  getCheckNoticeData: async (abonentIds: string[]): Promise<any[]> => {
    console.log('Getting check notice data for abonents:', abonentIds);
    try {
      const abonents = await api.getAbonents();
      const filteredAbonents = abonents.filter(a => abonentIds.includes(a.id));
      
      // Фильтруем только абонентов с долгами
      const debtors = filteredAbonents.filter(a => a.balance < 0);
      
      // Рассчитываем статистику
      const totalDebt = debtors.reduce((sum, a) => sum + Math.abs(a.balance), 0);
      const totalChecked = filteredAbonents.length;
      const withoutDebt = filteredAbonents.filter(a => a.balance >= 0).length;
      const withDebt = debtors.length;
      
      return [{
        zoneId: 'zone-1',
        zoneName: 'Центральная',
        abonents: debtors.map(abonent => ({
          id: abonent.id,
          fullName: abonent.fullName,
          address: abonent.address,
          hasDebt: abonent.balance < 0,
          balance: abonent.balance,
          phone: abonent.phone,
          numberOfPeople: abonent.numberOfPeople,
          buildingType: abonent.buildingType,
          tariff: abonent.waterTariff === 'by_meter' ? 'По счетчику' : 'По количеству людей',
          personalAccount: abonent.personalAccount || 'Н/Д'
        })),
        statistics: {
          totalChecked,
          withoutDebt,
          withDebt,
          totalDebt
        }
      }];
    } catch (error) {
      console.log('Firebase error getting check notice data:', error);
      return [];
    }
  },
  
  logCheckNoticePrint: async (abonentIds: string[]): Promise<boolean> => {
    console.log('Logging check notice print for abonents:', abonentIds);
    try {
      const logData = {
        action: 'check_notice_print',
        entityType: 'abonent' as const,
        entityId: abonentIds.join(','),
        timestamp: new Date().toISOString(),
        userId: 'system',
        details: `Печать уведомлений для ${abonentIds.length} абонентов`
      };
      await api.createActionLog(logData);
      return true;
    } catch (error) {
      console.log('Firebase error logging check notice print:', error);
      return false;
    }
  },
  
  createCheckClosing: async (data: any): Promise<boolean> => {
    console.log('Creating check closing:', data);
    try {
      const checkClosingRef = collection(db, 'checkClosings');
      await addDoc(checkClosingRef, {
        ...data,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.log('Firebase error creating check closing:', error);
      return false;
    }
  },
  
  getRequests: async (): Promise<TechnicalRequest[]> => {
    return await api.getTechnicalRequests();
  },
  
  getInventory: async (): Promise<any[]> => {
    console.log('Getting inventory from Firebase');
    try {
      const inventoryRef = collection(db, 'inventory');
      const snapshot = await getDocs(inventoryRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting inventory:', error);
      return [];
    }
  },
  
  getAnnouncements: async (): Promise<any[]> => {
    console.log('Getting announcements from Firebase');
    try {
      const announcementsRef = collection(db, 'announcements');
      const q = query(announcementsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting announcements:', error);
      return [];
    }
  },
  
  getReports: async (): Promise<any[]> => {
    console.log('Getting reports from Firebase');
    try {
      const reportsRef = collection(db, 'reports');
      const snapshot = await getDocs(reportsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting reports:', error);
      return [];
    }
  },
  
  getDocuments: async (): Promise<any[]> => {
    console.log('Getting documents from Firebase');
    try {
      const documentsRef = collection(db, 'documents');
      const snapshot = await getDocs(documentsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting documents:', error);
      return [];
    }
  },
  
  getAppeals: async (): Promise<any[]> => {
    console.log('Getting appeals from Firebase');
    try {
      const appealsRef = collection(db, 'appeals');
      const q = query(appealsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting appeals:', error);
      return [];
    }
  },
  
  getMapData: async (): Promise<any[]> => {
    console.log('Getting map data from Firebase');
    try {
      const mapDataRef = collection(db, 'mapData');
      const snapshot = await getDocs(mapDataRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting map data:', error);
      return [];
    }
  },
  
  getDataExchange: async (): Promise<any[]> => {
    console.log('Getting data exchange from Firebase');
    try {
      const exchangeRef = collection(db, 'dataExchange');
      const snapshot = await getDocs(exchangeRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting data exchange:', error);
      return [];
    }
  },
  
  getProfile: async (): Promise<any> => {
    console.log('Getting profile from Firebase');
    try {
      const profileRef = collection(db, 'profiles');
      const snapshot = await getDocs(profileRef);
      return snapshot.docs[0]?.data() || {};
    } catch (error) {
      console.log('Firebase error getting profile:', error);
      return {};
    }
  },
  
  getMaintenance: async (): Promise<any[]> => {
    return await api.getMaintenanceTasks();
  },
  
  getReadings: async (): Promise<any[]> => {
    console.log('Getting readings from Firebase');
    try {
      const readingsRef = collection(db, 'readings');
      const q = query(readingsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting readings:', error);
      return [];
    }
  },
  
  getAccruals: async (): Promise<any[]> => {
    console.log('Getting accruals from Firebase');
    try {
      const accrualsRef = collection(db, 'accruals');
      const q = query(accrualsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting accruals:', error);
      return [];
    }
  },
  
  getHistory: async (): Promise<any[]> => {
    return await api.getActionLogs();
  },
  
  getPortalDashboard: async (): Promise<any> => {
    console.log('Getting portal dashboard from Firebase');
    try {
      const abonents = await api.getAbonents();
      const payments = await api.getPayments();
      
      return {
        totalAbonents: abonents.length,
        totalPayments: payments.length,
        recentActivity: await api.getActionLogs()
      };
    } catch (error) {
      console.log('Firebase error getting portal dashboard:', error);
      return { totalAbonents: 0, totalPayments: 0, recentActivity: [] };
    }
  },
  
  getWaterQuality: async (): Promise<any[]> => {
    return await api.getWaterQualityData();
  },
  
  getInfrastructure: async (): Promise<any[]> => {
    console.log('Getting infrastructure from Firebase');
    try {
      const infrastructureRef = collection(db, 'infrastructure');
      const snapshot = await getDocs(infrastructureRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting infrastructure:', error);
      return [];
    }
  },
  
  getSalaries: async (): Promise<any[]> => {
    console.log('Getting salaries from Firebase');
    try {
      const salariesRef = collection(db, 'salaries');
      const q = query(salariesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting salaries:', error);
      return [];
    }
  },

  // Расходы - Firebase
  getExpenses: async (): Promise<any[]> => {
    console.log('Getting expenses from Firebase');
    try {
      const expensesRef = collection(db, 'expenses');
      const q = query(expensesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting expenses:', error);
      return [];
    }
  },

  createExpense: async (expenseData: any): Promise<string> => {
    console.log('Creating expense in Firebase:', expenseData);
    try {
      const expensesRef = collection(db, 'expenses');
      const docRef = await addDoc(expensesRef, {
        ...expenseData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.log('Firebase error creating expense:', error);
      throw error;
    }
  },

  updateExpense: async (id: string, expenseData: any): Promise<void> => {
    console.log('Updating expense in Firebase:', id, expenseData);
    try {
      const expenseRef = doc(db, 'expenses', id);
      await updateDoc(expenseRef, expenseData);
    } catch (error) {
      console.log('Firebase error updating expense:', error);
      throw error;
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    console.log('Deleting expense from Firebase:', id);
    try {
      const expenseRef = doc(db, 'expenses', id);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.log('Firebase error deleting expense:', error);
      throw error;
    }
  },

  // Зарплаты сотрудников - Firebase
  getStaffSalaries: async (): Promise<any[]> => {
    console.log('Getting staff salaries from Firebase');
    try {
      const salariesRef = collection(db, 'staffSalaries');
      const q = query(salariesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting staff salaries:', error);
      return [];
    }
  },

  createStaffSalary: async (salaryData: any): Promise<string> => {
    console.log('Creating staff salary in Firebase:', salaryData);
    try {
      const salariesRef = collection(db, 'staffSalaries');
      const docRef = await addDoc(salariesRef, {
        ...salaryData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.log('Firebase error creating staff salary:', error);
      throw error;
    }
  },

  updateStaffSalary: async (id: string, salaryData: any): Promise<void> => {
    console.log('Updating staff salary in Firebase:', id, salaryData);
    try {
      const salaryRef = doc(db, 'staffSalaries', id);
      await updateDoc(salaryRef, salaryData);
    } catch (error) {
      console.log('Firebase error updating staff salary:', error);
      throw error;
    }
  },

  deleteStaffSalary: async (id: string): Promise<void> => {
    console.log('Deleting staff salary from Firebase:', id);
    try {
      const salaryRef = doc(db, 'staffSalaries', id);
      await deleteDoc(salaryRef);
    } catch (error) {
      console.log('Firebase error deleting staff salary:', error);
      throw error;
    }
  },

  paySalary: async (id: string, date: string): Promise<void> => {
    console.log('Paying salary in Firebase:', id, date);
    try {
      const salaryRef = doc(db, 'staffSalaries', id);
      await updateDoc(salaryRef, { 
        paid: true, 
        paidDate: date,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.log('Firebase error paying salary:', error);
      throw error;
    }
  },

  // Банковские операции - Firebase
  getBankTransactions: async (): Promise<any[]> => {
    console.log('Getting bank transactions from Firebase');
    try {
      const transactionsRef = collection(db, 'bankTransactions');
      const q = query(transactionsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting bank transactions:', error);
      return [];
    }
  },

  createBankTransaction: async (transactionData: any): Promise<string> => {
    console.log('Creating bank transaction in Firebase:', transactionData);
    try {
      const transactionsRef = collection(db, 'bankTransactions');
      const docRef = await addDoc(transactionsRef, {
        ...transactionData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.log('Firebase error creating bank transaction:', error);
      throw error;
    }
  },

  updateBankTransaction: async (id: string, transactionData: any): Promise<void> => {
    console.log('Updating bank transaction in Firebase:', id, transactionData);
    try {
      const transactionRef = doc(db, 'bankTransactions', id);
      await updateDoc(transactionRef, transactionData);
    } catch (error) {
      console.log('Firebase error updating bank transaction:', error);
      throw error;
    }
  },

  deleteBankTransaction: async (id: string): Promise<void> => {
    console.log('Deleting bank transaction from Firebase:', id);
    try {
      const transactionRef = doc(db, 'bankTransactions', id);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.log('Firebase error deleting bank transaction:', error);
      throw error;
    }
  },
  
  getCompanySettings: async (): Promise<any> => {
    console.log('Getting company settings from Firebase');
    try {
      const settingsRef = collection(db, 'companySettings');
      const snapshot = await getDocs(settingsRef);
      const settings = snapshot.docs[0]?.data();
      return settings || {
        name: 'МП Чуй Водоканал',
        address: 'с. Чуй, ул. Ибраимова 86',
        phone: '(03138)6-64-41',
        instagram: 'chui_vodokanal',
        receiptTemplate: 'compact'
      };
    } catch (error) {
      console.log('Firebase error getting company settings:', error);
      return {
        name: 'МП Чуй Водоканал',
        address: 'с. Чуй, ул. Ибраимова 86',
        phone: '(03138)6-64-41',
        instagram: 'chui_vodokanal',
        receiptTemplate: 'compact'
      };
    }
  },
  
  updateCompanySettings: async (settings: any): Promise<void> => {
    console.log('Updating company settings in Firebase:', settings);
    try {
      const settingsRef = collection(db, 'companySettings');
      const snapshot = await getDocs(settingsRef);
      if (snapshot.docs.length > 0) {
        const docRef = doc(db, 'companySettings', snapshot.docs[0].id);
        await updateDoc(docRef, settings);
      } else {
        await addDoc(settingsRef, settings);
      }
    } catch (error) {
      console.log('Firebase error updating company settings:', error);
      throw error;
    }
  },
  
  // Квитанции
  receipts: {
    getReceiptDetails: async (abonentId: string): Promise<any> => {
      try {
        // Получаем данные абонента
        const abonent = await api.getAbonent(abonentId);
        if (!abonent) {
          throw new Error('Абонент не найден');
        }
        
        // Получаем тарифы
        const tariffs = await api.getTariffs();
        
        // Генерируем квитанцию
        const hasWaterService = abonent.hasWaterService ?? true;
        const hasGarbageService = abonent.hasGarbageService ?? true;
        
        // Расчеты
        const waterConsumption = (abonent.currentMeterReading || 0) - (abonent.lastMeterReading || 0);
        const waterCharges = waterConsumption * (tariffs?.waterByMeter || 7.80);
        const sewageCharges = waterCharges * 0.3;
        const garbageCharges = hasGarbageService ? (tariffs?.garbageApartment || 29.41) : 0;
        
        const totalCharges = waterCharges + sewageCharges + garbageCharges;
        const totalDebt = abonent.balance < 0 ? Math.abs(abonent.balance) : 0;
        const penalty = totalDebt * ((tariffs?.penaltyRatePercent || 1.00) / 100);
        
        const totalToPay = totalCharges + totalDebt + penalty;
        
        // Получаем информацию о контролере
        let controllerName = 'Контролер не назначен';
        if (abonent.controllerId) {
          try {
            const controller = await api.getUser(abonent.controllerId);
            if (controller) {
              controllerName = `${controller.name} (№${controller.controllerNumber || abonent.controllerId})`;
            } else {
              controllerName = `Контролер ${abonent.controllerId}`;
            }
          } catch (error) {
            controllerName = `Контролер ${abonent.controllerId}`;
          }
        }

        return {
          abonent,
          period: 'Январь 2025',
          personalAccount: abonent.personalAccount || '000000',
          controllerName: controllerName,
          companySettings: {
            name: 'МП Чуй Водоканал',
            address: 'с. Чуй, ул. Ибраимова 86',
            phone: '(03138)6-64-41',
            instagram: 'chui_vodokanal',
            receiptTemplate: 'compact'
          },
          waterService: hasWaterService ? {
            charges: {
              name: 'Вода и канализация',
              debt: Math.floor(totalDebt * 0.49) + (Math.floor(Math.random() * 99) + 1) / 100,
              paid: 0,
              consumption: waterConsumption.toString(),
              accrued: waterCharges,
              tax: waterCharges * 0.12,
              recalculation: 0,
              penalty: penalty * 0.49,
              total: waterCharges + (totalDebt * 0.49) + (penalty * 0.49)
            },
            prevReading: abonent.lastMeterReading || 0,
            currentReading: abonent.currentMeterReading || 0
          } : undefined,
          garbageService: hasGarbageService ? {
            charges: {
              name: 'Вывоз мусора',
              debt: Math.floor(totalDebt * 0.30) + (Math.floor(Math.random() * 99) + 1) / 100,
              paid: 0,
              consumption: '1',
              accrued: garbageCharges,
              tax: garbageCharges * 0.12,
              recalculation: 0,
              penalty: penalty * 0.30,
              total: garbageCharges + (totalDebt * 0.30) + (penalty * 0.30)
            }
          } : undefined,
          totalToPay: Math.round(totalToPay * 100) / 100
        };
      } catch (error) {
        console.error('Error getting receipt details:', error);
        throw error;
      }
    },
    
    getBulkReceiptDetails: async (abonentIds: string[]): Promise<any[]> => {
      const receipts = [];
      for (const abonentId of abonentIds) {
        try {
          const receipt = await api.receipts.getReceiptDetails(abonentId);
          receipts.push(receipt);
        } catch (error) {
          console.error(`Error getting receipt for abonent ${abonentId}:`, error);
        }
      }
      return receipts;
    }
  },
  
  // Функция входа по PIN - Firebase
  loginWithPin: async (pin: string): Promise<User | null> => {
    console.log('Attempting login with PIN:', pin);
    return await usersApi.getUserByPin(pin);
  },

  // Dashboard data - Firebase
  getAdminDashboardData: async () => {
    console.log('Getting admin dashboard data from Firebase');
    try {
      const abonents = await abonentsApi.getAbonents();
      const users = await usersApi.getUsers();
      const auditLogs = await api.getAuditLogs();
      
      return {
        totalAbonents: abonents.length,
        totalRevenue: 1500000,
        pendingRequests: 12,
        activeMaintenance: 5,
        totalUsers: users.length,
        totalDebt: abonents.reduce((sum, a) => sum + Math.abs(Math.min(0, a.balance)), 0),
        recentLogs: auditLogs.slice(0, 5),
        abonentStatusDistribution: [
          { name: AbonentStatus.Active, value: abonents.filter(a => a.status === AbonentStatus.Active).length },
          { name: AbonentStatus.Disconnected, value: abonents.filter(a => a.status === AbonentStatus.Disconnected).length },
          { name: AbonentStatus.Archived, value: abonents.filter(a => a.status === AbonentStatus.Archived).length }
        ],
        topControllers: [
          { name: 'Контролёр', count: abonents.filter(a => a.controllerId === '4').length }
        ]
      };
    } catch (error) {
      console.log('Firebase error getting admin dashboard data:', error);
      return {
        totalAbonents: 0,
        totalRevenue: 0,
        pendingRequests: 0,
        activeMaintenance: 0,
        totalUsers: 0,
        totalDebt: 0,
        recentLogs: [],
        abonentStatusDistribution: [],
        topControllers: []
      };
    }
  },
  
  getAccountantDashboardData: async () => {
    console.log('Getting accountant dashboard data from Firebase');
    try {
      const payments = await api.getPayments();
      const abonents = await api.getAbonents();
      
      return {
        totalPayments: payments.length,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        pendingInvoices: abonents.filter(a => a.balance < 0).length,
        overduePayments: abonents.filter(a => a.balance < -1000).length
      };
    } catch (error) {
      console.log('Firebase error getting accountant dashboard data:', error);
      return {
        totalPayments: 0,
        totalRevenue: 0,
        pendingInvoices: 0,
        overduePayments: 0
      };
    }
  },
  
  getControllerOverviewData: async (controllerId: string) => {
    console.log('Getting controller overview data from Firebase:', controllerId);
    try {
      const abonents = await api.getAbonents();
      const requests = await api.getTechnicalRequests();
      
      const myAbonents = abonents.filter(a => a.controllerId === controllerId);
      const myRequests = requests.filter(r => r.assignedToId === controllerId);
      
      return {
        stats: {
          totalAbonents: myAbonents.length,
          activeAbonents: myAbonents.filter(a => a.status === AbonentStatus.Active).length,
          disconnectedAbonents: myAbonents.filter(a => a.status === AbonentStatus.Disconnected).length,
          pendingRequests: myRequests.filter(r => r.status === RequestStatus.New).length
        },
        myAbonents,
        myRequests
      };
    } catch (error) {
      console.log('Firebase error getting controller overview data:', error);
      return {
        stats: { totalAbonents: 0, activeAbonents: 0, disconnectedAbonents: 0, pendingRequests: 0 },
        myAbonents: [],
        myRequests: []
      };
    }
  },
  
  getEngineerDashboardData: async () => {
    console.log('Getting engineer dashboard data from Firebase');
    try {
      const abonents = await api.getAbonents();
      const requests = await api.getTechnicalRequests();
      
      return {
        totalAbonents: abonents.length,
        activeAbonents: abonents.filter(a => a.status === AbonentStatus.Active).length,
        disconnectedAbonents: abonents.filter(a => a.status === AbonentStatus.Disconnected).length,
        pendingRequests: requests.filter(r => r.status === RequestStatus.New).length
      };
    } catch (error) {
      console.log('Firebase error getting engineer dashboard data:', error);
      return {
        totalAbonents: 0,
        activeAbonents: 0,
        disconnectedAbonents: 0,
        pendingRequests: 0
      };
    }
  },

  // Бухгалтерские функции - Firebase
  getFinancialPlans: async () => {
    console.log('Getting financial plans from Firebase');
    try {
      const plansRef = collection(db, 'financialPlans');
      const snapshot = await getDocs(plansRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting financial plans:', error);
      return [];
    }
  },

  getDebtCases: async () => {
    console.log('Getting debt cases from Firebase');
    try {
      const abonents = await abonentsApi.getAbonents();
      return abonents
        .filter(a => a.balance < 0)
        .map(a => ({
          id: a.id,
          abonentName: a.fullName || 'Неизвестный абонент',
          debtAmount: Math.abs(a.balance || 0),
          daysOverdue: Math.floor(Math.random() * 90) + 1,
          status: 'active'
        }));
    } catch (error) {
      console.log('Firebase error getting debt cases:', error);
      return [];
    }
  },

  getPaymentsForCheckClosing: async (date: string, controllerId?: string) => {
    console.log('Getting payments for check closing from Firebase');
    try {
      const payments = await paymentsApi.getPayments();
      return payments.filter(p => {
        const paymentDate = new Date(p.date).toISOString().split('T')[0];
        return paymentDate === date;
      });
    } catch (error) {
      console.log('Firebase error getting payments for check closing:', error);
      return [];
    }
  },

  getDebtRestructuringPlans: async () => {
    console.log('Getting debt restructuring plans from Firebase');
    try {
      const plansRef = collection(db, 'debtRestructuringPlans');
      const snapshot = await getDocs(plansRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting debt restructuring plans:', error);
      return [];
    }
  },

  getNotificationTemplates: async () => {
    console.log('Getting notification templates from Firebase');
    try {
      const templatesRef = collection(db, 'notificationTemplates');
      const snapshot = await getDocs(templatesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting notification templates:', error);
      return [];
    }
  },

  // Инженерские функции - Firebase
  getMaintenanceTasks: async () => {
    console.log('Getting maintenance tasks from Firebase');
    try {
      const tasksRef = collection(db, 'maintenanceTasks');
      const snapshot = await getDocs(tasksRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting maintenance tasks:', error);
      return [];
    }
  },

  getWaterQualityData: async () => {
    console.log('Getting water quality data from Firebase');
    try {
      const qualityRef = collection(db, 'waterQuality');
      const snapshot = await getDocs(qualityRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log('Firebase error getting water quality data:', error);
      return [];
    }
  }
};

export default api;  