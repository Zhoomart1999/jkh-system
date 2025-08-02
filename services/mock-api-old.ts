import { Role, User, Abonent, BuildingType, WaterTariffType, AbonentStatus, Tariffs, Payment, AuditLog, FinancialPlan, Accrual, AbonentHistory, PaymentSummary, ExpenseCategory, Expense, StaffSalary, FuelLog, MeterReading, TechnicalRequest, RequestType, RequestStatus, RequestPriority, PaymentMethod, BankType, AdminDashboardData, Announcement, AccountantDashboardData, ControllerOverviewData, DebtorsReportItem, ExpenseReportData, InventoryItem, SystemNotification, GISObject, PlannedMaintenanceTask, WaterQualitySample, ActionLog, IncomeReportData } from '../types';

// Функция для имитации задержки
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock данные
const mockUsers: User[] = [
  { id: '1', name: 'Администратор', role: Role.Admin, pin: '11111111', isActive: true },
  { id: '2', name: 'Инженер', role: Role.Engineer, pin: '22222222', isActive: true },
  { id: '3', name: 'Бухгалтер', role: Role.Accountant, pin: '33333333', isActive: true },
  { id: '4', name: 'Контролёр', role: Role.Controller, pin: '44444444', isActive: true }
];

// Mock данные для настроек компании
let mockCompanySettings = {
  name: 'МП "Токмок Водоканал"',
  address: 'г. Токмок, ул. Ленина 1',
  phone: '6-69-37, 0755 755 043',
  instagram: 'mp_tokmokvodokanal',
  receiptTemplate: 'compact'
};

const mockAbonents: Abonent[] = [
  {
    id: '1',
    fullName: 'Абик у. Азиз',
    address: 'ул. 3 мкр д. 50 кв. 27',
    phone: '+996700123456',
    numberOfPeople: 3,
    buildingType: BuildingType.Apartment,
    waterTariff: WaterTariffType.ByMeter,
    status: AbonentStatus.Active,
    balance: -1475.64,
    createdAt: '2024-01-01',
    hasGarden: false,
    hasWaterService: true,
    hasGarbageService: true,
    personalAccount: '111862',
    lastMeterReading: 1250,
    currentMeterReading: 1278.2,
    meterReadingMonth: '2025-01'
  },
  {
    id: '2',
    fullName: 'Акчалова Мария Петровна',
    address: 'ул. 3 мкр д. 50 кв. 27',
    phone: '+996700654321',
    numberOfPeople: 2,
    buildingType: BuildingType.Apartment,
    waterTariff: WaterTariffType.ByPerson,
    status: AbonentStatus.Active,
    balance: -1057.00,
    createdAt: '2024-01-01',
    hasGarden: false,
    hasWaterService: true,
    hasGarbageService: true,
    personalAccount: '1005412-0'
  },
  {
    id: '3',
    fullName: 'Сидоров Сидор Сидорович',
    address: 'ул. Мира, 15, дом 2',
    phone: '+996700111222',
    numberOfPeople: 4,
    buildingType: BuildingType.Private,
    waterTariff: WaterTariffType.ByMeter,
    status: AbonentStatus.Active,
    balance: 0,
    createdAt: '2024-01-01',
    hasGarden: true,
    gardenSize: 0.5,
    hasWaterService: true,
    hasGarbageService: true,
    personalAccount: '123456'
  },
  {
    id: '4',
    fullName: 'Козлова Анна Владимировна',
    address: 'ул. Пушкина, 10, кв. 5',
    phone: '+996700333444',
    numberOfPeople: 1,
    buildingType: BuildingType.Apartment,
    waterTariff: WaterTariffType.ByMeter,
    status: AbonentStatus.Active,
    balance: 250.50,
    createdAt: '2024-01-01',
    hasGarden: false,
    hasWaterService: true,
    hasGarbageService: true,
    personalAccount: '789012'
  },
  {
    id: '5',
    fullName: 'Нурматов Абдулла',
    address: 'ул. Манаса, 25, кв. 12',
    phone: '+996700555666',
    numberOfPeople: 5,
    buildingType: BuildingType.Private,
    waterTariff: WaterTariffType.ByMeter,
    status: AbonentStatus.Active,
    balance: -890.25,
    createdAt: '2024-01-01',
    hasGarden: true,
    gardenSize: 1,
    hasWaterService: true,
    hasGarbageService: true,
    personalAccount: '345678'
  }
];

const mockTariffs: Tariffs = {
  waterByMeter: 13.24,
  waterByPerson: 8.00,
  garbagePrivate: 50.00,
  garbageApartment: 31.00,
  salesTaxPercent: 12.00,
  penaltyRatePercent: 1.00,
  waterForGarden: { '0.5': 50, '1': 100, '0.3': 30, '0.2': 20 }
};

// Mock данные для платежей
const mockPayments: Payment[] = [
  {
    id: '1',
    abonentId: '1',
    abonentName: 'Абик у. Азиз',
    amount: 1475.64,
    date: '2025-01-15',
    method: PaymentMethod.Cash,
    paymentMethod: 'Наличные',
    collectorId: '4',
    recordedByName: 'Контролёр',
    recordedBy: '4',
    comment: 'Оплата за декабрь 2024'
  },
  {
    id: '2',
    abonentId: '2',
    abonentName: 'Акчалова Мария Петровна',
    amount: 1057.00,
    date: '2025-01-16',
    method: PaymentMethod.Bank,
    paymentMethod: 'Банковская карта',
    bankType: BankType.MBank,
    collectorId: '4',
    recordedByName: 'Контролёр',
    recordedBy: '4',
    comment: 'Оплата за январь 2025'
  },
  {
    id: '3',
    abonentId: '3',
    abonentName: 'Сидоров Сидор Сидорович',
    amount: 2500.00,
    date: '2025-01-17',
    method: PaymentMethod.Cash,
    paymentMethod: 'Наличные',
    collectorId: '4',
    recordedByName: 'Контролёр',
    recordedBy: '4',
    comment: 'Оплата за декабрь 2024'
  }
];

// Mock данные для заявок
const mockRequests: TechnicalRequest[] = [
  {
    id: '1',
    abonentId: '1',
    abonentName: 'Абик у. Азиз',
    abonentAddress: 'ул. 3 мкр д. 50 кв. 27',
    type: RequestType.LeakReport,
    status: RequestStatus.InProgress,
    priority: RequestPriority.High,
    createdAt: '2025-01-15',
    details: 'Протечка в ванной комнате',
    assignedToId: '2',
    assignedToName: 'Инженер'
  },
  {
    id: '2',
    abonentId: '2',
    abonentName: 'Акчалова Мария Петровна',
    abonentAddress: 'ул. 3 мкр д. 50 кв. 27',
    type: RequestType.MeterReplacement,
    status: RequestStatus.New,
    priority: RequestPriority.Normal,
    createdAt: '2025-01-16',
    details: 'Замена счетчика воды'
  }
];

// Mock данные для инвентаря
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Счетчик воды ВСХ-15',
    unit: 'шт.',
    quantity: 25,
    lowStockThreshold: 5
  },
  {
    id: '2',
    name: 'Труба ПВХ 50мм',
    unit: 'м.',
    quantity: 100,
    lowStockThreshold: 20
  },
  {
    id: '3',
    name: 'Кран шаровый 1/2"',
    unit: 'шт.',
    quantity: 15,
    lowStockThreshold: 10
  }
];

// --- USERS API ---
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    await delay(200);
    return mockUsers;
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await delay(300);
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      ...userData
    };
    mockUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return mockUsers[userIndex];
  },

  deleteUser: async (id: string): Promise<void> => {
    await delay(200);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    mockUsers.splice(userIndex, 1);
  }
};

// --- ABONENTS API ---
export const abonentsApi = {
  getAbonents: async (): Promise<Abonent[]> => {
    await delay(200);
    return mockAbonents;
  },

  createAbonent: async (abonentData: Omit<Abonent, 'id' | 'createdAt'>): Promise<Abonent> => {
    await delay(300);
    const newAbonent: Abonent = {
      id: (mockAbonents.length + 1).toString(),
      createdAt: new Date().toISOString(),
      ...abonentData
    };
    mockAbonents.push(newAbonent);
    return newAbonent;
  },

  updateAbonent: async (id: string, abonentData: Partial<Abonent>): Promise<Abonent> => {
    await delay(300);
    const abonentIndex = mockAbonents.findIndex(a => a.id === id);
    if (abonentIndex === -1) throw new Error('Abonent not found');
    
    mockAbonents[abonentIndex] = { ...mockAbonents[abonentIndex], ...abonentData };
    return mockAbonents[abonentIndex];
  },

  deleteAbonent: async (id: string): Promise<void> => {
    await delay(200);
    const abonentIndex = mockAbonents.findIndex(a => a.id === id);
    if (abonentIndex === -1) throw new Error('Abonent not found');
    mockAbonents.splice(abonentIndex, 1);
  }
};

// --- TARIFFS API ---
export const tariffsApi = {
  getTariffs: async (): Promise<Tariffs> => {
    await delay(200);
    return mockTariffs;
  },

  updateTariffs: async (tariffs: Partial<Tariffs>): Promise<Tariffs> => {
    await delay(300);
    Object.assign(mockTariffs, tariffs);
    return mockTariffs;
  }
};

// --- AUTH API ---
export const authApi = {
  login: async (pin: string): Promise<User | null> => {
    await delay(500);
    const user = mockUsers.find(u => u.pin === pin && u.isActive);
    return user || null;
  },

  logout: async (): Promise<void> => {
    await delay(200);
    // Mock logout
  }
};

// --- PAYMENTS API ---
export const paymentsApi = {
  getPayments: async (): Promise<Payment[]> => {
    await delay(200);
    return mockPayments;
  },

  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    await delay(300);
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData
    };
    return newPayment;
  }
};

// --- REQUESTS API ---
export const requestsApi = {
  getRequests: async (): Promise<TechnicalRequest[]> => {
    await delay(200);
    return mockRequests;
  },

  createRequest: async (requestData: Omit<TechnicalRequest, 'id' | 'createdAt'>): Promise<TechnicalRequest> => {
    await delay(300);
    const newRequest: TechnicalRequest = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...requestData
    };
    return newRequest;
  }
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    await delay(300);
    return {
      totalAbonents: mockAbonents.length,
      totalUsers: mockUsers.length,
      totalDebt: mockAbonents.reduce((sum, a) => sum + a.balance, 0),
      recentLogs: [],
      abonentStatusDistribution: [
        { name: 'Активные', value: mockAbonents.filter(a => a.status === AbonentStatus.Active).length },
        { name: 'Отключенные', value: mockAbonents.filter(a => a.status === AbonentStatus.Disconnected).length },
        { name: 'Архивные', value: mockAbonents.filter(a => a.status === AbonentStatus.Archived).length }
      ],
      topControllers: []
    };
  },

  getAccountantDashboard: async (): Promise<AccountantDashboardData> => {
    await delay(300);
    return {
      paymentsToday: 0,
      totalPaidThisMonth: 0,
      totalDebt: mockAbonents.reduce((sum, a) => sum + a.balance, 0),
      revenueVsExpense: [],
      recentTransactions: []
    };
  },

  getControllerOverview: async (): Promise<ControllerOverviewData> => {
    await delay(300);
    return {
      stats: {
        totalAbonents: mockAbonents.length,
        activeAbonents: mockAbonents.filter(a => a.status === AbonentStatus.Active).length,
        disconnectedAbonents: mockAbonents.filter(a => a.status === AbonentStatus.Disconnected).length,
        pendingRequests: 0
      },
      myAbonents: mockAbonents.map(a => ({
        id: a.id,
        fullName: a.fullName,
        address: a.address,
        balance: a.balance
      })),
      myRequests: []
    };
  }
};

// --- REPORTS API ---
export const reportsApi = {
  getDebtorsReport: async (): Promise<DebtorsReportItem[]> => {
    await delay(300);
    return mockAbonents
      .filter(a => a.balance > 0)
      .map(a => ({
        id: a.id,
        fullName: a.fullName,
        address: a.address,
        phone: a.phone,
        balance: a.balance
      }));
  },

  getExpenseReport: async (): Promise<ExpenseReportData> => {
    await delay(300);
    return {
      totalExpenses: 0,
      breakdown: []
    };
  },

  getIncomeReport: async (): Promise<IncomeReportData> => {
    await delay(300);
    return {
      totalIncome: 0,
      breakdown: []
    };
  }
};

// --- NOTIFICATIONS API ---
export const notificationsApi = {
  getNotifications: async (): Promise<SystemNotification[]> => {
    await delay(200);
    return [];
  },

  markAsRead: async (_id: string): Promise<void> => {
    await delay(200);
    // Mock implementation
  }
};

// --- ANNOUNCEMENTS API ---
export const announcementsApi = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    await delay(200);
    return [];
  },

  createAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    await delay(300);
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...announcementData
    };
    return newAnnouncement;
  }
};

// --- GIS API ---
export const gisApi = {
  getGISObjects: async (): Promise<GISObject[]> => {
    await delay(300);
    return [];
  },

  createGISObject: async (objectData: Omit<GISObject, 'id'>): Promise<GISObject> => {
    await delay(300);
    const newObject: GISObject = {
      id: Date.now().toString(),
      ...objectData
    };
    return newObject;
  }
};

// --- MAINTENANCE API ---
export const maintenanceApi = {
  getMaintenanceTasks: async (): Promise<PlannedMaintenanceTask[]> => {
    await delay(300);
    return [];
  },

  createMaintenanceTask: async (taskData: Omit<PlannedMaintenanceTask, 'id'>): Promise<PlannedMaintenanceTask> => {
    await delay(300);
    const newTask: PlannedMaintenanceTask = {
      id: Date.now().toString(),
      ...taskData
    };
    return newTask;
  }
};

// --- WATER QUALITY API ---
export const waterQualityApi = {
  getWaterQualitySamples: async (): Promise<WaterQualitySample[]> => {
    await delay(300);
    return [];
  },

  createWaterQualitySample: async (sampleData: Omit<WaterQualitySample, 'id'>): Promise<WaterQualitySample> => {
    await delay(300);
    const newSample: WaterQualitySample = {
      id: Date.now().toString(),
      ...sampleData
    };
    return newSample;
  }
};

// --- INVENTORY API ---
export const inventoryApi = {
  getInventoryItems: async (): Promise<InventoryItem[]> => {
    await delay(300);
    return mockInventory;
  },

  createInventoryItem: async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    await delay(300);
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      ...itemData
    };
    return newItem;
  }
};

// --- EXPORT API ---
export const exportApi = {
  exportToExcel: async (data: any[], filename: string): Promise<void> => {
    await delay(1000);
    // Mock export - в реальности здесь был бы экспорт в Excel
    console.log(`Exporting ${data.length} records to ${filename}.xlsx`);
  },

  exportToPDF: async (_data: any, _filename: string): Promise<void> => {
    await delay(1000);
    // Mock export - в реальности здесь был бы экспорт в PDF
    console.log(`Exporting to PDF`);
  }
};

// --- AUDIT LOGS API ---
export const auditLogsApi = {
  getAuditLogs: async (): Promise<ActionLog[]> => {
    await delay(300);
    return [
      {
        id: '1',
        userId: 'Бухгалтер',
        action: 'Создание платежа',
        entityType: 'payment',
        entityId: 'payment-1',
        details: 'Создан платеж на сумму 1500 сом для абонента Иванов И.И.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        userId: 'Администратор',
        action: 'Обновление тарифов',
        entityType: 'charge',
        entityId: 'tariff-1',
        details: 'Обновлены тарифы на водоснабжение',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        userId: 'Инженер',
        action: 'Создание заявки',
        entityType: 'abonent',
        entityId: 'request-1',
        details: 'Создана техническая заявка для абонента Петров П.П.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        ipAddress: '192.168.1.102'
      }
    ];
  }
};

// --- MAIN API EXPORT ---
export const api = {
  // Auth
  loginWithPin: authApi.login,
  abonentLogin: async (personalAccount: string, _password: string) => {
    await delay(500);
    const abonent = mockAbonents.find(a => a.id === personalAccount);
    return abonent || null;
  },

  // Users
  getUsers: usersApi.getUsers,
  createUser: usersApi.createUser,
  updateUser: usersApi.updateUser,
  deleteUser: usersApi.deleteUser,

  // Abonents
  getAbonents: abonentsApi.getAbonents,
  addAbonent: abonentsApi.createAbonent,
  updateAbonent: abonentsApi.updateAbonent,
  deleteAbonent: abonentsApi.deleteAbonent,
  resetAbonentPassword: async (_id: string) => {
    await delay(300);
    return '123456'; // Mock password
  },

  // Tariffs
  getTariffs: tariffsApi.getTariffs,
  createTariff: async (tariff: any) => {
    await delay(300);
    return tariff;
  },
  updateTariff: async (_id: string, tariff: any) => {
    await delay(300);
    return tariff;
  },

  // Payments
  getPayments: paymentsApi.getPayments,
  addPayment: paymentsApi.createPayment,
  updatePayment: async (payment: any) => {
    await delay(300);
    return payment;
  },
  deletePayment: async (_id: string) => {
    await delay(200);
    // Mock delete
  },
  recordPaymentByController: async (abonentId: string, amount: number, method: PaymentMethod) => {
    await delay(300);
    return { id: Date.now().toString(), abonentId, amount, method };
  },

  // Requests
  getTechnicalRequests: requestsApi.getRequests,
  createTechnicalRequest: requestsApi.createRequest,
  updateTechnicalRequest: async (id: string, data: any) => {
    await delay(300);
    return { id, ...data };
  },
  bulkAddRequests: async (requests: any[]) => {
    await delay(500);
    return requests.map((r, i) => ({ ...r, id: (Date.now() + i).toString() }));
  },

  // Dashboard
  getAdminDashboardData: dashboardApi.getAdminDashboard,
  getAccountantDashboardData: dashboardApi.getAccountantDashboard,
  getControllerOverviewData: dashboardApi.getControllerOverview,
  getEngineerDashboardData: async () => {
    await delay(300);
    return {
      totalAbonents: mockAbonents.length,
      totalRequests: 0,
      totalMaintenanceTasks: 0,
      recentActivity: []
    };
  },

  // Reports
  getDebtorsReport: reportsApi.getDebtorsReport,
  getExpenseReport: reportsApi.getExpenseReport,
  getIncomeReport: reportsApi.getIncomeReport,
  getUsedMaterialsReport: async (_startDate: string, _endDate: string) => {
    await delay(300);
    return [];
  },

  // Infrastructure
  getInfrastructureZones: async () => {
    await delay(300);
    return [];
  },
  addInfrastructureZone: async (name: string) => {
    await delay(300);
    return { id: Date.now().toString(), name };
  },

  // Maintenance
  getMaintenanceTasks: maintenanceApi.getMaintenanceTasks,
  updateMaintenanceTask: async (task: any) => {
    await delay(300);
    return task;
  },

  // Inventory
  getInventory: async () => {
    await delay(300);
    return [];
  },
  addInventoryItem: async (item: any) => {
    await delay(300);
    return { ...item, id: Date.now().toString() };
  },
  updateInventoryItem: async (item: any) => {
    await delay(300);
    return item;
  },

  // Meter Readings
  getMeterReadings: async (_abonentId: string) => {
    await delay(300);
    return [];
  },
  addMeterReading: async (reading: any) => {
    await delay(300);
    return { ...reading, id: Date.now().toString() };
  },

  // Water Quality
  getWaterQualitySamples: waterQualityApi.getWaterQualitySamples,
  addWaterQualitySample: waterQualityApi.createWaterQualitySample,

  // GIS
  getGISData: async () => {
    await delay(300);
    return [];
  },
  addGISObject: gisApi.createGISObject,

  // Financial
  getFinancialPlans: async () => {
    await delay(300);
    return [];
  },
  addFinancialPlan: async (plan: any) => {
    await delay(300);
    return { ...plan, id: Date.now().toString() };
  },
  updateFinancialPlan: async (plan: any) => {
    await delay(300);
    return plan;
  },
  deleteFinancialPlan: async (_id: string) => {
    await delay(200);
    // Mock delete
  },

  // Expenses
  getExpenses: async () => {
    await delay(300);
    return [];
  },

  // Staff Salaries
  getStaffSalaries: async () => {
    await delay(300);
    return [];
  },

  // Fuel Logs
  getFuelLogs: async () => {
    await delay(300);
    return [];
  },

  // Bank Operations
  getBankTransactions: async () => {
    await delay(300);
    return [];
  },
  importBankTransactions: async (transactions: any[]) => {
    await delay(500);
    return transactions;
  },
  confirmBankTransaction: async (id: string) => {
    await delay(300);
    return { id, confirmed: true };
  },

  // Debt Cases
  getDebtCases: async () => {
    await delay(300);
    return [];
  },

  // Announcements
  getAnnouncements: announcementsApi.getAnnouncements,
  addAnnouncement: announcementsApi.createAnnouncement,
  updateAnnouncement: async (announcement: any) => {
    await delay(300);
    return announcement;
  },
  deleteAnnouncement: async (_id: string) => {
    await delay(200);
    // Mock delete
  },

  // Company Settings
  getCompanySettings: async () => {
    await delay(300);
    return mockCompanySettings;
  },
  updateCompanySettings: async (settings: any) => {
    await delay(300);
    mockCompanySettings = { ...mockCompanySettings, ...settings };
    return settings;
  },

  // Audit Logs
  getAuditLogs: async () => {
    await delay(300);
    return [];
  },

  // Receipts
  getReceiptDetails: async (abonentId: string) => {
    await delay(300);
    const abonent = mockAbonents.find(a => a.id === abonentId);
    if (!abonent) {
      throw new Error('Abonent not found');
    }

    // Проверяем, подключен ли абонент к услугам
    const hasWaterService = abonent.hasWaterService !== false; // По умолчанию подключен к воде
    const hasGarbageService = abonent.hasGarbageService === true; // По умолчанию НЕ подключен к мусору

    // Генерируем реалистичные данные для квитанции
    const waterConsumption = hasWaterService ? (
      abonent.waterTariff === WaterTariffType.ByMeter 
        ? (abonent.currentMeterReading || 0) - (abonent.lastMeterReading || 0)
        : abonent.numberOfPeople * 3 // 3 м³ на человека по норме
    ) : 0;

    const waterRate = abonent.waterTariff === WaterTariffType.ByMeter ? 13.24 : 8.00;
    const sewageRate = 6.79;
    const garbageRate = abonent.buildingType === BuildingType.Apartment ? 31 : 50; // Мусор дешевле

    // Простые суммы с копейками от 1 до 99
    const waterAccrued = hasWaterService ? Math.floor(waterConsumption * waterRate) + (Math.floor(Math.random() * 99) + 1) / 100 : 0;
    const sewageAccrued = hasWaterService ? Math.floor(waterConsumption * sewageRate) + (Math.floor(Math.random() * 99) + 1) / 100 : 0;
    const garbageAccrued = hasGarbageService ? Math.floor(abonent.numberOfPeople * garbageRate) + (Math.floor(Math.random() * 99) + 1) / 100 : 0;

    // Распределяем долг пропорционально услугам
    const totalDebt = abonent.balance < 0 ? Math.abs(abonent.balance) : 0;
    let waterDebt = 0, sewageDebt = 0, garbageDebt = 0;
    
    if (totalDebt > 0) {
      if (hasWaterService && hasGarbageService) {
        // 70% вода + канализация, 30% мусор
        waterDebt = Math.floor(totalDebt * 0.49) + (Math.floor(Math.random() * 99) + 1) / 100; // 70% * 70% = 49%
        sewageDebt = Math.floor(totalDebt * 0.21) + (Math.floor(Math.random() * 99) + 1) / 100; // 70% * 30% = 21%
        garbageDebt = Math.floor(totalDebt * 0.30) + (Math.floor(Math.random() * 99) + 1) / 100; // 30%
      } else if (hasWaterService) {
        // Только вода + канализация
        waterDebt = Math.floor(totalDebt * 0.7) + (Math.floor(Math.random() * 99) + 1) / 100;
        sewageDebt = Math.floor(totalDebt * 0.3) + (Math.floor(Math.random() * 99) + 1) / 100;
      } else if (hasGarbageService) {
        // Только мусор
        garbageDebt = Math.floor(totalDebt) + (Math.floor(Math.random() * 99) + 1) / 100;
      }
    }

    // Пеня 1% от долга
    const waterPenalty = Math.floor(waterDebt * 0.01) + (Math.floor(Math.random() * 99) + 1) / 100;
    const sewagePenalty = Math.floor(sewageDebt * 0.01) + (Math.floor(Math.random() * 99) + 1) / 100;
    const garbagePenalty = Math.floor(garbageDebt * 0.01) + (Math.floor(Math.random() * 99) + 1) / 100;

    const waterTotal = waterAccrued + waterDebt + waterPenalty;
    const sewageTotal = sewageAccrued + sewageDebt + sewagePenalty;
    const garbageTotal = garbageAccrued + garbageDebt + garbagePenalty;

    const result: any = {
      abonent,
      period: 'Январь 2025',
      personalAccount: abonent.personalAccount || '000000',
      controllerName: `Турдубаева Э.Э. (№${abonent.controllerId || '001'})`,
      companySettings: mockCompanySettings,
      totalToPay: 0
    };

    // Добавляем воду только если подключен
    if (hasWaterService) {
      result.waterService = {
        charges: {
          name: 'Вода',
          debt: waterDebt,
          paid: 0,
          consumption: waterConsumption.toFixed(1),
          accrued: waterAccrued,
          tax: Math.floor(waterAccrued * 0.03) + (Math.floor(Math.random() * 99) + 1) / 100, // 3% налог
          recalculation: 0,
          penalty: waterPenalty,
          total: waterTotal
        },
        prevReading: abonent.lastMeterReading,
        currentReading: abonent.currentMeterReading
      };
      result.totalToPay += waterTotal + sewageTotal;
    }

    // Добавляем мусор только если подключен
    if (hasGarbageService) {
      result.garbageService = {
        charges: {
          name: 'Мусор',
          debt: garbageDebt,
          paid: 0,
          consumption: abonent.numberOfPeople.toString(),
          accrued: garbageAccrued,
          tax: 0,
          recalculation: 0,
          penalty: garbagePenalty,
          total: garbageTotal
        }
      };
      result.totalToPay += garbageTotal;
    }

    return result;
  },
  logReceiptPrint: async (_abonentIds: string[]) => {
    await delay(200);
    // Mock log
  },
    getBulkReceiptDetails: async (abonentIds: string[]) => {
    await delay(300);
    const results = [];
    
    for (const abonentId of abonentIds) {
      const abonent = mockAbonents.find(a => a.id === abonentId);
      if (!abonent) continue;

      // Проверяем, подключен ли абонент к услугам
      const hasWaterService = abonent.hasWaterService !== false; // По умолчанию подключен к воде
      const hasGarbageService = abonent.hasGarbageService === true; // По умолчанию НЕ подключен к мусору

      // Генерируем реалистичные данные для квитанции
      const waterConsumption = hasWaterService ? (
        abonent.waterTariff === WaterTariffType.ByMeter 
          ? (abonent.currentMeterReading || 0) - (abonent.lastMeterReading || 0)
          : abonent.numberOfPeople * 3
      ) : 0;

      const waterRate = abonent.waterTariff === WaterTariffType.ByMeter ? 13.24 : 8.00;
      const sewageRate = 6.79;
      const garbageRate = abonent.buildingType === BuildingType.Apartment ? 31 : 50;

      // Простые суммы с копейками от 1 до 99
      const waterAccrued = hasWaterService ? Math.floor(waterConsumption * waterRate) + (Math.floor(Math.random() * 99) + 1) / 100 : 0;
      const sewageAccrued = hasWaterService ? Math.floor(waterConsumption * sewageRate) + (Math.floor(Math.random() * 99) + 1) / 100 : 0;
      const garbageAccrued = hasGarbageService ? Math.floor(abonent.numberOfPeople * garbageRate) + (Math.floor(Math.random() * 99) + 1) / 100 : 0;

      // Распределяем долг пропорционально услугам
      const totalDebt = abonent.balance < 0 ? Math.abs(abonent.balance) : 0;
      let waterDebt = 0, sewageDebt = 0, garbageDebt = 0;
      
      if (totalDebt > 0) {
        if (hasWaterService && hasGarbageService) {
          // 70% вода + канализация, 30% мусор
          waterDebt = Math.floor(totalDebt * 0.49) + (Math.floor(Math.random() * 99) + 1) / 100; // 70% * 70% = 49%
          sewageDebt = Math.floor(totalDebt * 0.21) + (Math.floor(Math.random() * 99) + 1) / 100; // 70% * 30% = 21%
          garbageDebt = Math.floor(totalDebt * 0.30) + (Math.floor(Math.random() * 99) + 1) / 100; // 30%
        } else if (hasWaterService) {
          // Только вода + канализация
          waterDebt = Math.floor(totalDebt * 0.7) + (Math.floor(Math.random() * 99) + 1) / 100;
          sewageDebt = Math.floor(totalDebt * 0.3) + (Math.floor(Math.random() * 99) + 1) / 100;
        } else if (hasGarbageService) {
          // Только мусор
          garbageDebt = Math.floor(totalDebt) + (Math.floor(Math.random() * 99) + 1) / 100;
        }
      }

      // Пеня 1% от долга
      const waterPenalty = Math.floor(waterDebt * 0.01) + (Math.floor(Math.random() * 99) + 1) / 100;
      const sewagePenalty = Math.floor(sewageDebt * 0.01) + (Math.floor(Math.random() * 99) + 1) / 100;
      const garbagePenalty = Math.floor(garbageDebt * 0.01) + (Math.floor(Math.random() * 99) + 1) / 100;

      const waterTotal = waterAccrued + waterDebt + waterPenalty;
      const sewageTotal = sewageAccrued + sewageDebt + sewagePenalty;
      const garbageTotal = garbageAccrued + garbageDebt + garbagePenalty;

      const result: any = {
        abonent,
        period: 'Январь 2025',
        personalAccount: abonent.personalAccount || '000000',
        controllerName: `Турдубаева Э.Э. (№${abonent.controllerId || '001'})`,
        companySettings: {
          name: 'МП "Токмок Водоканал"',
          address: 'г. Токмок, ул. Ленина 1',
          phone: '6-69-37, 0755 755 043',
          instagram: 'mp_tokmokvodokanal',
          receiptTemplate: 'compact'
        },
        totalToPay: 0
      };

      // Добавляем воду только если подключен
      if (hasWaterService) {
        result.waterService = {
          charges: {
            name: 'Вода',
            debt: waterDebt,
            paid: 0,
            consumption: waterConsumption.toFixed(1),
            accrued: waterAccrued,
            tax: Math.floor(waterAccrued * 0.03) + (Math.floor(Math.random() * 99) + 1) / 100,
            recalculation: 0,
            penalty: waterPenalty,
            total: waterTotal
          },
          prevReading: abonent.lastMeterReading,
          currentReading: abonent.currentMeterReading
        };
        result.totalToPay += waterTotal + sewageTotal;
      }

      // Добавляем мусор только если подключен
      if (hasGarbageService) {
        result.garbageService = {
          charges: {
            name: 'Мусор',
            debt: garbageDebt,
            paid: 0,
            consumption: abonent.numberOfPeople.toString(),
            accrued: garbageAccrued,
            tax: 0,
            recalculation: 0,
            penalty: garbagePenalty,
            total: garbageTotal
          }
        };
        result.totalToPay += garbageTotal;
      }

      results.push(result);
    }
    
    return results;
  },

  // QR Codes
  createQRCode: async (abonentId: string, amount: number) => {
    await delay(300);
    return {
      id: Date.now().toString(),
      abonentId,
      amount,
      bankType: 'MBank' as any,
      qrCode: 'mock-qr-code-data',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as any
    };
  },

  // Check Notices
  getCheckNoticeData: async (abonentIds: string[]) => {
    await delay(300);
    return [{
      zoneId: '1',
      zoneName: 'Зона 1',
      abonents: abonentIds.map(id => {
        const abonent = mockAbonents.find(a => a.id === id);
        return {
          id: abonent?.id || id,
          fullName: abonent?.fullName || 'Неизвестный абонент',
          address: abonent?.address || 'Неизвестный адрес',
          hasDebt: (abonent?.balance || 0) < 0,
          balance: abonent?.balance || 0
        };
      })
    }];
  },
  logCheckNoticePrint: async (_abonentIds: string[]) => {
    await delay(200);
    // Mock log
  },

  // Check Closing
  getPaymentsForCheckClosing: async (_date: string, _controllerId?: string) => {
    await delay(300);
    return mockPayments.map(payment => ({
      paymentId: payment.id,
      abonentId: payment.abonentId,
      abonentName: payment.abonentName,
      amount: payment.amount,
      paymentMethod: payment.method,
      date: payment.date,
      isBankPayment: payment.method === PaymentMethod.Bank,
      bankType: payment.bankType,
      comment: payment.comment
    }));
  },
  getCheckClosings: async (_params: any) => {
    await delay(300);
    return [];
  },
  createCheckClosing: async (data: any) => {
    await delay(300);
    return { ...data, id: Date.now().toString() };
  },
  confirmCheckClosing: async (id: string) => {
    await delay(300);
    return { id, confirmed: true };
  },
  cancelCheckClosing: async (id: string, reason: string) => {
    await delay(300);
    return { id, cancelled: true, reason };
  },
  exportCheckClosingReport: async (_id: string) => {
    await delay(1000);
    return 'mock-report-url';
  },

  // Manual Charges
  updateManualCharge: async (charge: any) => {
    await delay(300);
    return charge;
  },
  addManualCharge: async (charge: any) => {
    await delay(300);
    return { ...charge, id: Date.now().toString() };
  },

  // Abonent History
  getAbonentHistory: async (_abonentId: string) => {
    await delay(300);
    return {
      payments: mockPayments.filter(p => p.abonentId === _abonentId),
      accruals: []
    };
  },

  // Generate Monthly Accruals
  generateMonthlyAccruals: async () => {
    await delay(1000);
    return [];
  },

  // Data Exchange
  bulkAddAbonents: async (abonents: any[]) => {
    await delay(1000);
    return abonents.map((a, i) => ({ ...a, id: (Date.now() + i).toString() }));
  },

  // Portal
  getPortalData: async (abonentId: string) => {
    await delay(300);
    return {
      abonentId,
      balance: 0,
      history: [],
      announcements: []
    };
  },

  // Notifications
  getNotifications: notificationsApi.getNotifications,
  markNotificationAsRead: notificationsApi.markAsRead,

  // Notification Templates
  getNotificationTemplates: async () => {
    await delay(300);
    return [
      {
        id: '1',
        type: 'debt_warning',
        title: 'Предупреждение о долге',
        template: 'Уважаемый {name}, у вас есть задолженность в размере {debt} сом. Пожалуйста, оплатите до {date}.',
        variables: ['name', 'debt', 'date'],
        isActive: true
      },
      {
        id: '2',
        type: 'service_disconnection',
        title: 'Отключение услуги',
        template: 'Уважаемый {name}, из-за задолженности {debt} сом ваша услуга будет отключена {date}.',
        variables: ['name', 'debt', 'date'],
        isActive: true
      }
    ];
  },

  // Notification Campaigns
  getNotificationCampaigns: async () => {
    await delay(300);
    return [];
  },

  // Debt Restructuring
  getDebtRestructuringPlans: async () => {
    await delay(300);
    return [];
  },

  // Export
  exportToExcel: exportApi.exportToExcel,
  exportToPDF: exportApi.exportToPDF
}; 