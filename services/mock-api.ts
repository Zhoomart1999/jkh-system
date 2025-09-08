import {
  Abonent,
  Payment,
  Tariffs,
  Notification,
  TechnicalRequest,
  RequestType,
  RequestStatus,
  RequestPriority,
  BuildingType,
  WaterTariffType,
  Announcement,
  AbonentStatus,
  PaymentMethod,
  NotificationType,
  User,
  Role,
  ExpenseCategory
} from '../types';

// Mock API implementation
export const api = {
  // Abonents API
  getAbonents: async (): Promise<Abonent[]> => {
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));

      // Возвращаем мок данные для абонентов
      return [
        {
          id: '1',
          fullName: 'Абдраева Н.Т.',
          address: 'ул. Космонавтов, дом 9',
          personalAccount: '25080009',
          balance: -4407.00,
          waterDebt: 3084.90,
          garbageDebt: 1322.10,
          status: AbonentStatus.Active,
          waterTariff: WaterTariffType.ByPerson,
          waterService: true,
          garbageService: true,
          hasGarden: false,
          currentMeterReading: 0,
          prevMeterReading: 0,
          penaltyRate: '0',
          gardenTariff: '0',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          fullName: 'Абдразакова М.',
          address: 'ул. Октябрьская, дом 10 кв. 10',
          personalAccount: '25080010',
          balance: -1420.00,
          waterDebt: 994.00,
          garbageDebt: 426.00,
          status: AbonentStatus.Active,
          waterTariff: WaterTariffType.ByPerson,
          waterService: true,
          garbageService: true,
          hasGarden: false,
          currentMeterReading: 0,
          prevMeterReading: 0,
          penaltyRate: '0',
          gardenTariff: '0',
          createdAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить абонентов');
    }
  },

  getAbonent: async (id: string): Promise<Abonent | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Имитация поиска абонента по ID
      const mockAbonents = await api.getAbonents();
      return mockAbonents.find(abonent => abonent.id === id) || null;
    } catch (error) {
      throw new Error('Не удалось загрузить абонента');
    }
  },

  createAbonent: async (abonentData: Omit<Abonent, 'id'>): Promise<Abonent> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newAbonent: Abonent = {
        id: Date.now().toString(),
        ...abonentData,
        balance: 0,
        waterDebt: 0,
        garbageDebt: 0,
        hasGarden: false,
        currentMeterReading: 0,
        prevMeterReading: 0,
        penaltyRate: '0',
        gardenTariff: '0',
        createdAt: new Date().toISOString()
      };

      return newAbonent;
    } catch (error) {
      throw new Error('Не удалось создать абонента');
    }
  },

  updateAbonent: async (id: string, updateData: Partial<Abonent>): Promise<Abonent> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const existingAbonent = await api.getAbonent(id);
      if (!existingAbonent) {
        throw new Error('Абонент не найден');
      }

      const updatedAbonent: Abonent = {
        ...existingAbonent,
        ...updateData
      };

      return updatedAbonent;
    } catch (error) {
      throw new Error('Не удалось обновить абонента');
    }
  },

  deleteAbonent: async (id: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Имитация удаления
    } catch (error) {
      throw new Error('Не удалось удалить абонента');
    }
  },

  // Users API
  getUsers: async (): Promise<User[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      return [
        {
          id: '1',
          name: 'Тагаева С.Ж.',
          role: Role.Controller,
          pin: '12345678',
          isActive: true,
          controllerNumber: '001'
        },
        {
          id: '2',
          name: 'Иванов И.И.',
          role: Role.Engineer,
          pin: '87654321',
          isActive: true
        },
        {
          id: '3',
          name: 'Петров П.П.',
          role: Role.Accountant,
          pin: '11223344',
          isActive: true
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить пользователей');
    }
  },

  // Payments API
  getPayments: async (): Promise<Payment[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      return [
        {
          id: '1',
          abonentId: '1',
          amount: 1000,
          date: new Date().toISOString(),
          method: PaymentMethod.Cash,
          status: 'completed'
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить платежи');
    }
  },

  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const newPayment: Payment = {
        id: Date.now().toString(),
        ...paymentData
      };

      return newPayment;
    } catch (error) {
      throw new Error('Не удалось создать платеж');
    }
  },

  updatePayment: async (id: string, updateData: Partial<Payment>): Promise<Payment> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const existingPayment = await api.getPayments().then(payments =>
        payments.find(p => p.id === id)
      );

      if (!existingPayment) {
        throw new Error('Платеж не найден');
      }

      const updatedPayment: Payment = {
        ...existingPayment,
        ...updateData
      };

      return updatedPayment;
    } catch (error) {
      throw new Error('Не удалось обновить платеж');
    }
  },

  deletePayment: async (): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Имитация удаления
    } catch (error) {
      throw new Error('Не удалось удалить платеж');
    }
  },

  // Tariffs API
  getTariffs: async (): Promise<Tariffs[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      return [
        {
          waterByMeter: 3.5,
          waterByPerson: 3.5,
          garbagePrivate: 50.0,
          garbageApartment: 31.0,
          salesTaxPercent: 12.0,
          penaltyRatePercent: 0.5,
          waterForGarden: { '100': 500, '200': 1000, '300': 1500 }
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить тарифы');
    }
  },

  // Notifications API
  getNotifications: async (): Promise<Notification[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      return [
        {
          id: '1',
          title: 'Системное уведомление',
          message: 'Система работает в штатном режиме',
          type: 'system' as NotificationType,
          createdAt: new Date().toISOString(),
          isRead: false,
          sentVia: 'system',
          deliveryStatus: 'delivered'
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить уведомления');
    }
  },

  createNotification: async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const newNotification: Notification = {
        id: Date.now().toString(),
        ...notificationData,
        createdAt: new Date().toISOString()
      };

      return newNotification;
    } catch (error) {
      throw new Error('Не удалось создать уведомление');
    }
  },

  // Technical Requests API
  getTechnicalRequests: async (): Promise<TechnicalRequest[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      return [
        {
          id: '1',
          abonentId: '1',
          type: RequestType.LeakReport,
          status: RequestStatus.Pending,
          priority: RequestPriority.Normal,
          createdAt: new Date().toISOString(),
          assignedToId: undefined
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить заявки');
    }
  },

  createTechnicalRequest: async (requestData: Omit<TechnicalRequest, 'id' | 'createdAt'>): Promise<TechnicalRequest> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const newRequest: TechnicalRequest = {
        id: Date.now().toString(),
        ...requestData,
        createdAt: new Date().toISOString()
      };

      return newRequest;
    } catch (error) {
      throw new Error('Не удалось создать заявку');
    }
  },

  updateTechnicalRequest: async (id: string, updateData: Partial<TechnicalRequest>): Promise<TechnicalRequest> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const existingRequest = await api.getTechnicalRequests().then(requests =>
        requests.find(r => r.id === id)
      );

      if (!existingRequest) {
        throw new Error('Заявка не найдена');
      }

      const updatedRequest: TechnicalRequest = {
        ...existingRequest,
        ...updateData
      };

      return updatedRequest;
    } catch (error) {
      throw new Error('Не удалось обновить заявку');
    }
  },

  // Check Closing API
  createCheckClosing: async (checkData: any): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const newCheckClosing = {
        id: Date.now().toString(),
        ...checkData,
        createdAt: new Date().toISOString()
      };

      // Сохраняем в localStorage для имитации базы данных
      const existingData = localStorage.getItem('checkClosings') || '[]';
      const checkClosings = JSON.parse(existingData);
      checkClosings.push(newCheckClosing);
      localStorage.setItem('checkClosings', JSON.stringify(checkClosings));

      return newCheckClosing;
    } catch (error) {
      throw new Error('Не удалось создать закрытие чека');
    }
  },

  getCheckClosings: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const existingData = localStorage.getItem('checkClosings') || '[]';
      return JSON.parse(existingData);
    } catch (error) {
      throw new Error('Не удалось загрузить закрытия чеков');
    }
  },

  // Mass Print Logging
  logMassPrint: async (): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      // Имитация логирования
    } catch (error) {
      throw new Error('Не удалось залогировать массовую печать');
    }
  },

  // Receipt Print Logging
  logReceiptPrint: async (): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      // Создаем уведомление о печати
      await api.createNotification({
        title: 'Печать квитанции',
        message: 'Квитанция отправлена на печать',
        type: 'system' as NotificationType,
        isRead: false,
        sentVia: 'system',
        deliveryStatus: 'delivered'
      });
    } catch (error) {
      throw new Error('Не удалось залогировать печать квитанции');
    }
  },

  // Export to Excel
  exportAbonentsToExcel: async (abonentsToExport: Abonent[]): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Создаем CSV данные (Excel формат)
      const headers = ['ID', 'ФИО', 'Адрес', 'Лицевой счет', 'Баланс', 'Долг за воду', 'Долг за мусор', 'Статус', 'Контролер'];
      const csvData = [
        headers.join(','),
        ...abonentsToExport.map(abonent => [
          abonent.id,
          `"${abonent.fullName}"`,
          `"${abonent.address}"`,
          `"${abonent.personalAccount || ''}"`,
          abonent.balance,
          abonent.waterDebt || 0,
          abonent.garbageDebt || 0,
          abonent.status,
          'Не назначен' // Mock controller name
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'abonents.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      throw new Error('Не удалось экспортировать данные');
    }
  },

  // Bulk operations
  bulkUpdateAbonents: async (abonentIds: string[], updateData: Partial<Abonent>): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const id of abonentIds) {
        await api.updateAbonent(id, updateData);
      }
    } catch (error) {
      throw new Error('Не удалось обновить абонентов');
    }
  },

  bulkDeleteAbonents: async (abonentIds: string[]): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const id of abonentIds) {
        await api.deleteAbonent(id);
      }
    } catch (error) {
      throw new Error('Не удалось удалить абонентов');
    }
  },

  // Controllers API
  getControllers: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      return [
        {
          id: '1',
          name: 'Тагаева С.Ж.',
          role: 'controller',
          phone: '+996 555 123 456',
          email: 'tagaeva@example.com',
          isActive: true
        },
        {
          id: '2',
          name: 'Иванов И.И.',
          role: 'controller',
          phone: '+996 555 234 567',
          email: 'ivanov@example.com',
          isActive: true
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить контроллеров');
    }
  },

  // Close Check API
  closeCheck: async (abonentId: string, amount: number): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const abonent = await api.getAbonent(abonentId);
      if (!abonent) {
        throw new Error('Абонент не найден');
      }

      // Обновляем баланс абонента
      const updatedAbonent = await api.updateAbonent(abonentId, {
        balance: (abonent.balance || 0) + amount
      });

      return {
        success: true,
        abonent: updatedAbonent,
        closedAmount: amount
      };
    } catch (error) {
      throw new Error('Не удалось закрыть чек');
    }
  },

  // Generate Personal Account
  generatePersonalAccount: async (): Promise<string> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      // Генерируем уникальный лицевой счет
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `25${timestamp.slice(-6)}${random}`;
    } catch (error) {
      throw new Error('Не удалось сгенерировать лицевой счет');
    }
  },

  // Announcements API
  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          title: 'Важное объявление',
          content: 'Система будет недоступна с 2:00 до 4:00 для технического обслуживания',
          createdAt: new Date().toISOString(),
          isActive: true
        },
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить объявления');
    }
  },

  createAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...announcementData,
        createdAt: new Date().toISOString()
      };
      return newAnnouncement;
    } catch (error) {
      throw new Error('Не удалось создать объявление');
    }
  },

  // Meter Readings API
  getMeterReadings: async (abonentId: string): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Возвращаем мок историю показаний
      return [
        {
          id: '1',
          abonentId,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          value: 1250,
          previousValue: 1200,
          consumption: 50
        },
        {
          id: '2',
          abonentId,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          value: 1200,
          previousValue: 1150,
          consumption: 50
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить показания счетчика');
    }
  },

  addMeterReading: async (readingData: any): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const newReading = {
        id: Date.now().toString(),
        ...readingData,
        createdAt: new Date().toISOString()
      };

      return newReading;
    } catch (error) {
      throw new Error('Не удалось добавить показание счетчика');
    }
  },

  // Reports API
  getDebtorsReport: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const abonents = await api.getAbonents();
      return abonents
        .filter(a => a.balance < -500)
        .map(a => ({
          id: a.id,
          fullName: a.fullName,
          address: a.address,
          phone: a.phone || 'Не указан',
          balance: a.balance
        }));
    } catch (error) {
      throw new Error('Не удалось загрузить отчет по должникам');
    }
  },

  getUsedMaterialsReport: async (startDate: string, endDate: string): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      return [
        {
          id: '1',
          materialName: 'Трубы ПВХ 100мм',
          quantity: 50,
          unit: 'м',
          cost: 2500,
          date: startDate
        },
        {
          id: '2',
          materialName: 'Краны шаровые',
          quantity: 25,
          unit: 'шт',
          cost: 1500,
          date: endDate
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить отчет по материалам');
    }
  },

  // Receipt Details API
  getReceiptDetails: async (abonentId: string): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const abonent = await api.getAbonent(abonentId);
      if (!abonent) {
        throw new Error('Абонент не найден');
      }

      return {
        abonent,
        period: 'Декабрь 2024',
        personalAccount: abonent.personalAccount,
        controllerName: 'Тагаева С.Ж.',
        companySettings: {
          name: 'МП "ЧУЙ ВОДОКАНАЛ"',
          address: 'г. Токмок, ул. Ленина 1',
          phone: '6-69-37, 0559909143',
          instagram: 'mp_tokmokvodokanal',
          receiptTemplate: 'tokmok'
        },
        waterService: {
          charges: {
            name: 'Холодная вода',
            debt: abonent.waterDebt || 0,
            accrued: 0,
            total: abonent.waterDebt || 0
          }
        },
        garbageService: {
          charges: {
            name: 'Стоки',
            debt: abonent.garbageDebt || 0,
            accrued: 0,
            total: abonent.garbageDebt || 0
          }
        },
        totalToPay: Math.abs(abonent.balance)
      };
    } catch (error) {
      throw new Error('Не удалось загрузить данные квитанции');
    }
  },

  // Dashboard API
  getEngineerDashboardData: async (): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      throw new Error('Не удалось загрузить данные дашборда');
    }
  },

  getAccountantDashboardData: async (): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      throw new Error('Не удалось загрузить данные дашборда бухгалтера');
    }
  },

  getAdminDashboardData: async (): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      throw new Error('Не удалось загрузить данные дашборда админа');
    }
  },

  // Audit and Action Logs API
  getAuditLogs: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: '1',
          userName: 'Тагаева С.Ж.',
          action: 'Создание заявки',
          details: 'Создана заявка на ремонт счетчика'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          userId: '2',
          userName: 'Иванов И.И.',
          action: 'Обновление абонента',
          details: 'Обновлены данные абонента Абдраева Н.Т.'
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить аудит логи');
    }
  },

  // Expenses API
  getExpenses: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          date: new Date().toISOString(),
          amount: 5000,
          category: 'Office',
          description: 'Канцелярские товары',
          responsiblePersonId: '3',
          responsiblePersonName: 'Петров П.П.'
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить расходы');
    }
  },

  addExpense: async (expenseData: any): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newExpense = {
        id: Date.now().toString(),
        ...expenseData
      };

      return newExpense;
    } catch (error) {
      throw new Error('Не удалось добавить расход');
    }
  },

  updateExpense: async (expenseData: any): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return expenseData;
    } catch (error) {
      throw new Error('Не удалось обновить расход');
    }
  },

  // Salaries API
  getSalaries: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          userId: '1',
          name: 'Тагаева С.Ж.',
          role: Role.Controller,
          monthlySalary: 25000,
          lastPaidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить зарплаты');
    }
  },

  paySalary: async (salaryId: string): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        message: 'Зарплата выплачена успешно'
      };
    } catch (error) {
      throw new Error('Не удалось выплатить зарплату');
    }
  },

  // Fuel API
  getFuelLogs: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          truckId: 'T001',
          date: new Date().toISOString(),
          liters: 50,
          cost: 2500,
          route: 'Маршрут 1',
          driverName: 'Водитель 1'
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить логи топлива');
    }
  },

  // Financial Plans API
  getFinancialPlans: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          revenueTarget: 1000000,
          collected: 750000,
          expenseCeilings: {
            [ExpenseCategory.Salaries]: 300000,
            [ExpenseCategory.Fuel]: 50000,
            [ExpenseCategory.Repairs]: 100000
          },
          totalExpenses: 450000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          period: 'monthly',
          status: 'active'
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить финансовые планы');
    }
  },

  // Bank Operations API
  getBankTransactions: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          date: new Date().toISOString(),
          amount: 10000,
          description: 'Платеж от абонента',
          bankType: 'KICB',
          accountNumber: '1234567890',
          abonentId: '1',
          isConfirmed: true
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить банковские транзакции');
    }
  },

  importBankTransactions: async (file: File): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        imported: 10,
        message: 'Транзакции импортированы успешно'
      };
    } catch (error) {
      throw new Error('Не удалось импортировать транзакции');
    }
  },

  confirmBankTransaction: async (transactionId: string): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        message: 'Транзакция подтверждена'
      };
    } catch (error) {
      throw new Error('Не удалось подтвердить транзакцию');
    }
  },

  // Debt Management API
  getDebtCases: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          abonentId: '1',
          abonentName: 'Абдраева Н.Т.',
          currentDebt: 5000,
          debtAgeDays: 90,
          status: 'Monitoring',
          history: [
            { date: new Date().toISOString(), action: 'Предупреждение отправлено' }
          ]
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить дела по долгам');
    }
  },

  // Manual Charges API
  getManualCharges: async (): Promise<any[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: '1',
          abonentId: '1',
          amount: 500,
          type: 'penalty',
          reason: 'Просрочка платежа',
          date: new Date().toISOString(),
          createdBy: '1',
          createdAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new Error('Не удалось загрузить ручные начисления');
    }
  },

  addManualCharge: async (chargeData: any): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newCharge = {
        id: Date.now().toString(),
        ...chargeData
      };

      return newCharge;
    } catch (error) {
      throw new Error('Не удалось добавить ручное начисление');
    }
  },

  // Controller Overview API
  getControllerOverviewData: async (controllerId: string): Promise<any> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const abonents = await api.getAbonents();
      const requests = await api.getTechnicalRequests();
      
      // Фильтруем абонентов и заявки для конкретного контроллера
      const myAbonents = abonents.filter(a => a.controllerId === controllerId);
      const myRequests = requests.filter(r => r.assignedToId === controllerId);
      
      return {
        stats: {
          totalAbonents: myAbonents.length,
          activeAbonents: myAbonents.filter(a => a.status === AbonentStatus.Active).length,
          disconnectedAbonents: myAbonents.filter(a => a.status === AbonentStatus.Disconnected).length,
          pendingRequests: myRequests.filter(r => r.status === RequestStatus.Pending).length
        },
        myAbonents: myAbonents.map(a => ({
          id: a.id,
          fullName: a.fullName,
          address: a.address,
          balance: a.balance
        })),
        myRequests: myRequests.map(r => ({
          id: r.id,
          type: r.type,
          abonentName: r.abonentName || 'Неизвестно',
          status: r.status
        }))
      };
    } catch (error) {
      throw new Error('Не удалось загрузить данные контроллера');
    }
  },

  // Check Closing API
  confirmCheckClosing: async (id: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // В реальном приложении здесь будет обновление в базе данных
      console.log(`Check closing ${id} confirmed`);
    } catch (error) {
      throw new Error('Не удалось подтвердить закрытие чека');
    }
  },

  cancelCheckClosing: async (id: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // В реальном приложении здесь будет обновление в базе данных
      console.log(`Check closing ${id} cancelled`);
    } catch (error) {
      throw new Error('Не удалось отменить закрытие чека');
    }
  }
}; 