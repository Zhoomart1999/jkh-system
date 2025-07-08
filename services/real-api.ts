import { Role, User, Abonent, BuildingType, WaterTariffType, AbonentStatus, Tariffs, Payment, AuditLog, FinancialPlan, Accrual, AbonentHistory, PaymentSummary, ExpenseCategory, Expense, StaffSalary, FuelLog, MeterReading, TechnicalRequest, RequestType, RequestStatus, RequestTypeLabels, RequestStatusLabels, InfrastructureZone, ReceiptDetails, ReceiptChargeItem, CheckNoticeZoneGroup, CheckNoticeAbonent, PaymentMethod, CompanySettings, AdminDashboardData, Announcement, AccountantDashboardData, RecentTransaction, ControllerOverviewData, DebtorsReportItem, ExpenseReportData, InventoryItem, WorkOrderDetails, SystemNotification, SystemNotificationType, TurnoverSheetRow, CashierReportData, GISObject, GISObjectType, PlannedMaintenanceTask, MaintenanceStatus, WaterQualitySample, BankStatementTransaction, ReconciliationStatus, DebtCase, DebtStatus, AbonentPortalData, RequestPriority, RequestPriorityLabels, UsedMaterialReportItem, IncomeReportData, IncomeBreakdown, BankType, QRCodePayment, ManualCharge, BulkCharge, BankTransaction, Document, AbonentAppeal, DebtPaymentPlan, ActionLog, CheckClosingPayment, CheckClosing, CheckClosingFormData, CheckClosingSummary, TariffVersion } from '../types';

// API URL для разных окружений
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Функция для выполнения HTTP запросов
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Функция для имитации задержки (можно убрать в продакшене)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- USERS API ---
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    await delay(200);
    const users = await apiRequest('/users');
    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      role: user.role as Role,
      pin: user.pin,
      isActive: user.is_active
    }));
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await delay(300);
    const user = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        role: userData.role,
        pin: userData.pin,
        is_active: userData.isActive
      })
    });
    return {
      id: user.id,
      name: user.name,
      role: user.role as Role,
      pin: user.pin,
      isActive: user.is_active
    };
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    await delay(300);
    const user = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: userData.name,
        role: userData.role,
        pin: userData.pin,
        is_active: userData.isActive
      })
    });
    return {
      id: user.id,
      name: user.name,
      role: user.role as Role,
      pin: user.pin,
      isActive: user.is_active
    };
  },

  deleteUser: async (id: string): Promise<void> => {
    await delay(200);
    await apiRequest(`/users/${id}`, { method: 'DELETE' });
  }
};

// --- ABONENTS API ---
export const abonentsApi = {
  getAbonents: async (): Promise<Abonent[]> => {
    await delay(200);
    const abonents = await apiRequest('/abonents');
    return abonents.map((abonent: any) => ({
      id: abonent.id,
      fullName: abonent.full_name,
      address: abonent.address,
      phone: abonent.phone,
      numberOfPeople: abonent.number_of_people,
      buildingType: abonent.building_type as BuildingType,
      waterTariff: abonent.water_tariff as WaterTariffType,
      status: abonent.status as AbonentStatus,
      balance: abonent.balance,
      createdAt: abonent.created_at || new Date().toISOString(),
      zoneId: abonent.zone_id,
      hasGarden: abonent.has_garden || false,
      gardenSize: abonent.garden_size,
      controllerId: abonent.controller_id,
      lastPenaltyDate: abonent.last_penalty_date,
      personalAccount: abonent.personal_account,
      password: abonent.password,
      isImportedDebt: abonent.is_imported_debt || false
    }));
  },

  createAbonent: async (abonentData: Omit<Abonent, 'id'>): Promise<Abonent> => {
    await delay(300);
    const abonent = await apiRequest('/abonents', {
      method: 'POST',
      body: JSON.stringify({
        full_name: abonentData.fullName,
        address: abonentData.address,
        phone: abonentData.phone,
        number_of_people: abonentData.numberOfPeople,
        building_type: abonentData.buildingType,
        water_tariff: abonentData.waterTariff,
        status: abonentData.status,
        balance: abonentData.balance
      })
    });
    return {
      id: abonent.id,
      fullName: abonent.full_name,
      address: abonent.address,
      phone: abonent.phone,
      numberOfPeople: abonent.number_of_people,
      buildingType: abonent.building_type as BuildingType,
      waterTariff: abonent.water_tariff as WaterTariffType,
      status: abonent.status as AbonentStatus,
      balance: abonent.balance,
      createdAt: abonent.created_at || new Date().toISOString(),
      zoneId: abonent.zone_id,
      hasGarden: abonent.has_garden || false,
      gardenSize: abonent.garden_size,
      controllerId: abonent.controller_id,
      lastPenaltyDate: abonent.last_penalty_date,
      personalAccount: abonent.personal_account,
      password: abonent.password,
      isImportedDebt: abonent.is_imported_debt || false
    };
  },

  updateAbonent: async (id: string, abonentData: Partial<Abonent>): Promise<Abonent> => {
    await delay(300);
    const abonent = await apiRequest(`/abonents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        full_name: abonentData.fullName,
        address: abonentData.address,
        phone: abonentData.phone,
        number_of_people: abonentData.numberOfPeople,
        building_type: abonentData.buildingType,
        water_tariff: abonentData.waterTariff,
        status: abonentData.status,
        balance: abonentData.balance
      })
    });
    return {
      id: abonent.id,
      fullName: abonent.full_name,
      address: abonent.address,
      phone: abonent.phone,
      numberOfPeople: abonent.number_of_people,
      buildingType: abonent.building_type as BuildingType,
      waterTariff: abonent.water_tariff as WaterTariffType,
      status: abonent.status as AbonentStatus,
      balance: abonent.balance,
      createdAt: abonent.created_at || new Date().toISOString(),
      zoneId: abonent.zone_id,
      hasGarden: abonent.has_garden || false,
      gardenSize: abonent.garden_size,
      controllerId: abonent.controller_id,
      lastPenaltyDate: abonent.last_penalty_date,
      personalAccount: abonent.personal_account,
      password: abonent.password,
      isImportedDebt: abonent.is_imported_debt || false
    };
  },

  deleteAbonent: async (id: string): Promise<void> => {
    await delay(200);
    await apiRequest(`/abonents/${id}`, { method: 'DELETE' });
  }
};

// --- PAYMENTS API ---
export const paymentsApi = {
  getPayments: async (): Promise<Payment[]> => {
    await delay(200);
    const payments = await apiRequest('/payments');
    return payments.map((payment: any) => ({
      id: payment.id,
      abonentId: payment.abonent_id,
      abonentName: payment.abonent_name || '',
      amount: payment.amount,
      date: payment.date,
      method: payment.method as PaymentMethod,
      paymentMethod: payment.payment_method,
      collectorId: payment.collector_id,
      recordedByName: payment.recorded_by_name || '',
      recordedBy: payment.recorded_by,
      comment: payment.comment,
      bankType: payment.bank_type as BankType
    }));
  },

  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    await delay(300);
    const payment = await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        abonent_id: paymentData.abonentId,
        amount: paymentData.amount,
        date: paymentData.date,
        method: paymentData.method,
        payment_method: paymentData.paymentMethod,
        collector_id: paymentData.collectorId,
        recorded_by: paymentData.recordedBy,
        comment: paymentData.comment
      })
    });
    return {
      id: payment.id,
      abonentId: payment.abonent_id,
      abonentName: payment.abonent_name || '',
      amount: payment.amount,
      date: payment.date,
      method: payment.method as PaymentMethod,
      paymentMethod: payment.payment_method,
      collectorId: payment.collector_id,
      recordedByName: payment.recorded_by_name || '',
      recordedBy: payment.recorded_by,
      comment: payment.comment,
      bankType: payment.bank_type as BankType
    };
  },

  updatePayment: async (id: string, paymentData: Partial<Payment>): Promise<Payment> => {
    await delay(300);
    const payment = await apiRequest(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        abonent_id: paymentData.abonentId,
        amount: paymentData.amount,
        date: paymentData.date,
        method: paymentData.method,
        payment_method: paymentData.paymentMethod,
        collector_id: paymentData.collectorId,
        recorded_by: paymentData.recordedBy,
        comment: paymentData.comment
      })
    });
    return {
      id: payment.id,
      abonentId: payment.abonent_id,
      abonentName: payment.abonent_name || '',
      amount: payment.amount,
      date: payment.date,
      method: payment.method as PaymentMethod,
      paymentMethod: payment.payment_method,
      collectorId: payment.collector_id,
      recordedByName: payment.recorded_by_name || '',
      recordedBy: payment.recorded_by,
      comment: payment.comment,
      bankType: payment.bank_type as BankType
    };
  },

  deletePayment: async (id: string): Promise<void> => {
    await delay(200);
    await apiRequest(`/payments/${id}`, { method: 'DELETE' });
  }
};

// --- TARIFFS API ---
export const tariffsApi = {
  getTariffs: async (): Promise<Tariffs> => {
    await delay(100);
    const tariffs = await apiRequest('/tariffs');
    // Возвращаем последний активный тариф
    const activeTariff = tariffs.find((t: any) => t.is_active) || tariffs[0];
    if (!activeTariff) {
      // Возвращаем дефолтные тарифы если нет в БД
      return {
        waterByMeter: 13.24,
        waterByPerson: 40.51,
        garbagePrivate: 19.61,
        garbageApartment: 31.00,
        salesTaxPercent: 3,
        penaltyRatePercent: 0.1,
        waterForGarden: {
          '1': 1485,
          '0.5': 742.5,
          '0.3': 445.5,
          '0.2': 297,
        }
      };
    }
    
    return {
      waterByMeter: activeTariff.water_by_meter,
      waterByPerson: activeTariff.water_by_person,
      garbagePrivate: activeTariff.garbage_private,
      garbageApartment: activeTariff.garbage_apartment,
      salesTaxPercent: activeTariff.sales_tax_percent,
      penaltyRatePercent: activeTariff.penalty_rate_percent,
      waterForGarden: {
        '1': 1485,
        '0.5': 742.5,
        '0.3': 445.5,
        '0.2': 297,
      }
    };
  },

  createTariff: async (tariffData: Tariffs, effectiveDate?: string, description?: string): Promise<Tariffs> => {
    await delay(500);
    const tariff = await apiRequest('/tariffs', {
      method: 'POST',
      body: JSON.stringify({
        version: 1,
        effective_date: effectiveDate || new Date().toISOString().split('T')[0],
        water_by_meter: tariffData.waterByMeter,
        water_by_person: tariffData.waterByPerson,
        garbage_private: tariffData.garbagePrivate,
        garbage_apartment: tariffData.garbageApartment,
        sales_tax_percent: tariffData.salesTaxPercent,
        penalty_rate_percent: tariffData.penaltyRatePercent,
        created_by: 'system',
        is_active: true,
        description: description || 'Обновление тарифов'
      })
    });
    
    return {
      waterByMeter: tariff.water_by_meter,
      waterByPerson: tariff.water_by_person,
      garbagePrivate: tariff.garbage_private,
      garbageApartment: tariff.garbage_apartment,
      salesTaxPercent: tariff.sales_tax_percent,
      penaltyRatePercent: tariff.penalty_rate_percent,
      waterForGarden: {
        '1': 1485,
        '0.5': 742.5,
        '0.3': 445.5,
        '0.2': 297,
      }
    };
  },

  updateTariff: async (id: string, tariffData: Tariffs): Promise<Tariffs> => {
    await delay(500);
    const tariff = await apiRequest(`/tariffs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        water_by_meter: tariffData.waterByMeter,
        water_by_person: tariffData.waterByPerson,
        garbage_private: tariffData.garbagePrivate,
        garbage_apartment: tariffData.garbageApartment,
        sales_tax_percent: tariffData.salesTaxPercent,
        penalty_rate_percent: tariffData.penaltyRatePercent
      })
    });
    
    return {
      waterByMeter: tariff.water_by_meter,
      waterByPerson: tariff.water_by_person,
      garbagePrivate: tariff.garbage_private,
      garbageApartment: tariff.garbage_apartment,
      salesTaxPercent: tariff.sales_tax_percent,
      penaltyRatePercent: tariff.penalty_rate_percent,
      waterForGarden: {
        '1': 1485,
        '0.5': 742.5,
        '0.3': 445.5,
        '0.2': 297,
      }
    };
  },

  deleteTariff: async (id: string): Promise<void> => {
    await delay(200);
    await apiRequest(`/tariffs/${id}`, { method: 'DELETE' });
  }
};

// --- AUTH API ---
export const authApi = {
  loginWithPin: async (pin: string): Promise<User | null> => {
    await delay(300);
    try {
      console.log('Attempting login with PIN:', pin);
      const users = await usersApi.getUsers();
      console.log('Found users:', users.length);
      const user = users.find(u => u.pin === pin && u.isActive);
      console.log('Found user:', user ? user.name : 'null');
      return user || null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }
};

// --- MAIN API OBJECT ---
export const realApi = {
  // Auth
  loginWithPin: authApi.loginWithPin,
  
  // Users
  getUsers: usersApi.getUsers,
  createUser: usersApi.createUser,
  updateUser: usersApi.updateUser,
  deleteUser: usersApi.deleteUser,
  
  // Abonents
  getAbonents: abonentsApi.getAbonents,
  createAbonent: abonentsApi.createAbonent,
  updateAbonent: abonentsApi.updateAbonent,
  deleteAbonent: abonentsApi.deleteAbonent,
  
  // Payments
  getPayments: paymentsApi.getPayments,
  createPayment: paymentsApi.createPayment,
  updatePayment: paymentsApi.updatePayment,
  deletePayment: paymentsApi.deletePayment,
  
  // Tariffs
  getTariffs: tariffsApi.getTariffs,
  createTariff: tariffsApi.createTariff,
  updateTariff: tariffsApi.updateTariff,
  deleteTariff: tariffsApi.deleteTariff,
  
  // Placeholder functions for compatibility (return empty data)
  getAccruals: async (): Promise<Accrual[]> => { await delay(200); return []; },
  getAuditLogs: async (): Promise<AuditLog[]> => { await delay(200); return []; },
  getFinancialPlans: async (): Promise<FinancialPlan[]> => { await delay(200); return []; },
  getExpenses: async (): Promise<Expense[]> => { await delay(200); return []; },
  getStaffSalaries: async (): Promise<StaffSalary[]> => { await delay(200); return []; },
  getFuelLogs: async (): Promise<FuelLog[]> => { await delay(200); return []; },
  getMeterReadings: async (): Promise<MeterReading[]> => { await delay(200); return []; },
  getTechnicalRequests: async (): Promise<TechnicalRequest[]> => { await delay(200); return []; },
  getInventory: async (): Promise<InventoryItem[]> => { await delay(200); return []; },
  getGisObjects: async (): Promise<GISObject[]> => { await delay(200); return []; },
  getMaintenanceTasks: async (): Promise<PlannedMaintenanceTask[]> => { await delay(200); return []; },
  getWaterQualitySamples: async (): Promise<WaterQualitySample[]> => { await delay(200); return []; },
  getBankTransactions: async (): Promise<BankStatementTransaction[]> => { await delay(200); return []; },
  getDebtCases: async (): Promise<DebtCase[]> => { await delay(200); return []; },
  getNotifications: async (): Promise<SystemNotification[]> => { await delay(200); return []; },
  getCompanySettings: async (): Promise<CompanySettings> => { 
    await delay(100); 
    return {
      name: 'МП "Токмок Водоканал"',
      address: 'г.Токмок, ул. Ленина 1',
      phone: '6-69-37, 0755 755 043',
      instagram: 'instagram/mp_tokmokvodokanal'
    };
  },
  getAnnouncements: async (): Promise<Announcement[]> => { await delay(200); return []; },
  getZones: async (): Promise<InfrastructureZone[]> => { await delay(200); return []; },
  
  // Dashboard data (simplified)
  getAdminDashboardData: async (): Promise<AdminDashboardData> => {
    await delay(400);
    const abonents = await abonentsApi.getAbonents();
    const payments = await paymentsApi.getPayments();
    const users = await usersApi.getUsers();
    
    return {
      totalAbonents: abonents.length,
      totalUsers: users.length,
      totalDebt: abonents.reduce((sum, a) => sum + Math.abs(Math.min(0, a.balance)), 0),
      recentLogs: [],
      abonentStatusDistribution: [
        { name: 'Активные', value: abonents.filter(a => a.status === AbonentStatus.Active).length },
        { name: 'Отключенные', value: abonents.filter(a => a.status === AbonentStatus.Disconnected).length },
        { name: 'Архивные', value: abonents.filter(a => a.status === AbonentStatus.Archived).length }
      ],
      topControllers: []
    };
  },
  
  getAccountantDashboardData: async (): Promise<AccountantDashboardData> => {
    await delay(400);
    const payments = await paymentsApi.getPayments();
    const today = new Date();
    const todayPayments = payments.filter(p => 
      new Date(p.date).toDateString() === today.toDateString()
    );
    
    return {
      paymentsToday: todayPayments.length,
      totalPaidThisMonth: payments
        .filter(p => new Date(p.date).getMonth() === today.getMonth())
        .reduce((sum, p) => sum + p.amount, 0),
      totalDebt: 0, // Нужно будет добавить расчет долгов
      recentTransactions: todayPayments.slice(0, 5).map(p => ({
        id: p.id,
        date: p.date,
        description: `Платеж от ${p.abonentName}`,
        amount: p.amount,
        type: 'income' as const
      })),
      revenueVsExpense: [
        { name: 'Доходы', revenue: payments.reduce((sum, p) => sum + p.amount, 0), expense: 0 },
        { name: 'Расходы', revenue: 0, expense: 0 }
      ]
    };
  }
}; 