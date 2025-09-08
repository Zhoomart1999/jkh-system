// Core enums - must be defined before their label mappings
export enum Role {
    Admin = 'admin',
    Engineer = 'engineer',
    Accountant = 'accountant',
    Controller = 'controller'
}

export enum AbonentStatus {
    Active = 'active',
    Inactive = 'inactive',
    Disconnected = 'disconnected',
    Suspended = 'suspended',
    Archived = 'archived'
}

export enum WaterTariffType {
    Flat = 'flat',
    Meter = 'meter',
    Garden = 'garden',
    ByPerson = 'by_person',
    ByMeter = 'by_meter'
}

export enum PaymentMethod {
    Cash = 'cash',
    Bank = 'bank',
    Card = 'card',
    Transfer = 'transfer',
    QR = 'qr',
    CashRegister = 'cash_register',
    System = 'system'
}

export enum NotificationType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Success = 'success'
}

export enum RequestType {
    Leak = 'leak',
    LowPressure = 'low_pressure',
    NoWater = 'no_water',
    Quality = 'quality',
    Meter = 'meter',
    Other = 'other'
}

export enum RequestStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
    Cancelled = 'cancelled'
}

export enum RequestPriority {
    Low = 'low',
    Normal = 'normal',
    High = 'high',
    Critical = 'critical',
    Urgent = 'urgent'
}

export enum MaintenanceStatus {
    Planned = 'planned',
    InProgress = 'in_progress',
    Completed = 'completed',
    Overdue = 'overdue'
}

export enum ExpenseCategory {
    Salaries = 'salaries',
    Fuel = 'fuel',
    Repairs = 'repairs',
    Maintenance = 'maintenance',
    Office = 'office',
    Taxes = 'taxes'
}

export enum ManualChargeType {
    Penalty = 'penalty',
    Adjustment = 'adjustment',
    Retroactive = 'retroactive',
    Other = 'other'
}

export enum DebtStatus {
    Monitoring = 'monitoring',
    WarningSent = 'warning_sent',
    PreLegal = 'pre_legal',
    LegalAction = 'legal_action',
    Closed = 'closed'
}

export enum BankType {
    KICB = 'kicb',
    Demir = 'demir',
    MBank = 'mbank',
    Bakai = 'bakai',
    Other = 'other'
}

export interface User {
    id: string;
    name: string;
    role: Role;
    pin: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    controllerNumber?: string; // Номер контролёра (обязательно для контролёров)
}

export enum BuildingType {
    Private = 'private',
    Apartment = 'apartment',
}

export interface Abonent {
    id: string;
    fullName: string;
    phone?: string;
    address: string;
    apartment?: string;
    waterService: boolean;
    garbageService: boolean;
    waterTariff: WaterTariffType;
    status: AbonentStatus;
    waterDebt: number;
    garbageDebt: number;
    debtComment?: string;
    controllerId?: string;
    hasGarden: boolean;
    personalAccount?: string;
    balance: number;
    prevMeterReading?: number;
    currentMeterReading?: number;
    penaltyRate?: string;
    gardenTariff?: string;
    createdAt?: string;
    updatedAt?: string;
    numberOfPeople?: number;
    buildingType?: BuildingType;
    lastMeterReading?: number;
}

export interface Tariffs {
    waterByMeter: number;
    waterByPerson: number;
    garbagePrivate: number;
    garbageApartment: number;
    salesTaxPercent: number;
    penaltyRatePercent: number;
    waterForGarden: { [key: string]: number }; // key: size, value: yearly rate
}

// --- Версионирование тарифов ---
export interface TariffVersion {
    id: string;
    version: number;
    effectiveDate: string; // Дата вступления в силу (YYYY-MM-DD)
    tariffs: Tariffs;
    createdBy: string;
    createdAt: string;
    isActive: boolean;
    description?: string; // Причина изменения
}

export interface TariffHistory {
    id: string;
    serviceType: 'water' | 'garbage' | 'garden';
    oldRate: number;
    newRate: number;
    effectiveDate: string;
    approvedBy: string;
    approvedAt: string;
    reason: string;
    region?: string;
}

export interface Payment {
    id: string;
    abonentId: string;
    amount: number;
    date: string; // ISO string
    method: PaymentMethod;
    description?: string;
    status: 'completed' | 'pending' | 'failed';
    receiptId?: string;
    processedBy?: string; // User ID of the accountant/cashier
    createdAt?: string;
    updatedAt?: string;
    abonentName?: string;
    comment?: string;
    paymentMethod?: PaymentMethod;
    collectorId?: string;
    recordedByName?: string;
    isBankPayment?: boolean;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    createdAt: string;
    isRead: boolean;
    userId?: string; // If notification is for a specific user
    abonentId?: string; // If notification is related to an abonent
    sentVia?: 'email' | 'sms' | 'system';
    deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface TechnicalRequest {
    id: string;
    abonentId: string;
    type: RequestType;
    description: string;
    status: RequestStatus;
    priority: RequestPriority;
    createdAt: string;
    updatedAt?: string;
    assignedToId?: string; // User ID of the engineer/controller assigned
    workOrder?: string; // Link to work order
    newAction?: string; // New action taken
    abonentName?: string; // For display purposes
    abonentAddress?: string; // For display purposes
    details?: WorkOrderDetails;
    assignedToName?: string;
    history?: { date: string; action: string; userName: string; }[];
    notes?: string;
}

export interface CheckClosing {
    id: string;
    abonentId: string;
    abonentName: string;
    abonentAddress: string;
    personalAccount: string;
    waterDebt: number;
    garbageDebt: number;
    totalDebt: number;
    controllerName: string;
    closingDate: string; // ISO string
    status: 'closed' | 'pending';
    createdAt?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string; // Changed from 'message' to 'content'
    isActive: boolean;
    createdAt: string;
    notifySubscribers?: boolean;
}

// Report interfaces
export interface DebtorsReportItem {
    id: string;
    fullName: string;
    address: string;
    phone: string;
    balance: number;
}

export interface UsedMaterialReportItem {
    id: string;
    materialName: string;
    quantity: number;
    unit: string;
    cost: number;
    date: string;
}

// Receipt interfaces
export interface ReceiptDetails {
    abonent: Abonent;
    period: string;
    personalAccount: string;
    controllerName: string;
    companySettings: {
        name: string;
        address: string;
        phone: string;
        instagram: string;
        receiptTemplate: string;
    };
    waterService: {
        charges: ReceiptChargeItem;
    };
    garbageService: {
        charges: ReceiptChargeItem;
    };
    totalToPay: number;
}

export interface ReceiptChargeItem {
    name: string;
    debt: number;
    accrued: number;
    total: number;
    prevReading?: number;
    currentReading?: number;
    consumption?: number;
    paid?: number;
    tax?: number;
    recalculation?: number;
    penalty?: number;
}

// Label mappings - moved to end after all enums are defined
export const RequestStatusLabels: Record<RequestStatus, string> = {
    [RequestStatus.Pending]: 'Ожидает',
    [RequestStatus.InProgress]: 'В работе',
    [RequestStatus.Completed]: 'Завершено',
    [RequestStatus.Cancelled]: 'Отменено'
};

export const RequestTypeLabels: Record<RequestType, string> = {
    [RequestType.Leak]: 'Утечка',
    [RequestType.LowPressure]: 'Низкое давление',
    [RequestType.NoWater]: 'Нет воды',
    [RequestType.Quality]: 'Качество воды',
    [RequestType.Meter]: 'Счетчик',
    [RequestType.Other]: 'Другое'
};

export const RequestPriorityLabels: Record<RequestPriority, string> = {
    [RequestPriority.Low]: 'Низкий',
    [RequestPriority.Normal]: 'Обычный',
    [RequestPriority.High]: 'Высокий',
    [RequestPriority.Critical]: 'Критический',
    [RequestPriority.Urgent]: 'Срочный'
};

export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
    [ExpenseCategory.Salaries]: 'Зарплаты',
    [ExpenseCategory.Fuel]: 'Топливо (ГСМ)',
    [ExpenseCategory.Repairs]: 'Ремонт техники',
    [ExpenseCategory.Maintenance]: 'Обслуживание инфраструктуры',
    [ExpenseCategory.Office]: 'Административные расходы',
    [ExpenseCategory.Taxes]: 'Налоги'
};

export const DebtStatusLabels: Record<DebtStatus, string> = {
    [DebtStatus.Monitoring]: 'Мониторинг',
    [DebtStatus.WarningSent]: 'Предупреждение отправлено',
    [DebtStatus.PreLegal]: 'Досудебная претензия',
    [DebtStatus.LegalAction]: 'Передано в суд',
    [DebtStatus.Closed]: 'Закрыто'
};

export const ManualChargeTypeLabels: Record<ManualChargeType, string> = {
    [ManualChargeType.Penalty]: 'Пеня',
    [ManualChargeType.Adjustment]: 'Корректировка',
    [ManualChargeType.Retroactive]: 'Ретроактивное начисление',
    [ManualChargeType.Other]: 'Другое'
};

export const BankTypeLabels: Record<BankType, string> = {
    [BankType.KICB]: 'КИКБ',
    [BankType.Demir]: 'Демир Банк',
    [BankType.MBank]: 'М-Банк',
    [BankType.Bakai]: 'Бакай Банк',
    [BankType.Other]: 'Другой'
};

// Maintenance types
export interface PlannedMaintenanceTask {
    id: string;
    title: string;
    gisObjectId: string;
    frequencyDays: number;
    lastCompleted: string;
    nextDueDate: string;
    status: MaintenanceStatus;
    assignedToId?: string;
}

// Infrastructure types
export interface InfrastructureZone {
    id: string;
    name: string;
    gridPosition?: { row: number; col: number };
}

// Inventory types
export interface InventoryItem {
    id: string;
    name: string;
    unit: string; // e.g., 'шт.', 'м.'
    quantity: number;
    lowStockThreshold: number;
}

// Water Quality types
export interface WaterQualitySample {
    id: string;
    location: string;
    date: string;
    ph: number; // Normal 6.5-8.5
    chlorine: number; // Normal 0.2-0.5 mg/L
    turbidity: number; // Normal < 1 NTU
}

// Work Order types
export interface WorkOrderDetails {
    completedAt?: string;
    hoursSpent?: number;
    notes?: string;
    usedMaterials?: { itemId: string; name: string; unit: string; quantity: number }[];
    photos?: { before: string; after: string }; // Base64 encoded images
    history?: { date: string; action: string; userName: string; }[];
}

// Expense types
export interface Expense {
    id: string;
    date: string;
    amount: number;
    category: ExpenseCategory;
    description: string;
    responsiblePersonId: string;
    responsiblePersonName: string;
    documentUrl?: string; // Base64 encoded image
}

// Staff types
export interface StaffSalary {
    id: string;
    userId: string;
    name: string;
    role: Role;
    monthlySalary: number;
    lastPaidDate: string | null;
}

// Fuel types
export interface FuelLog {
    id: string;
    truckId: string;
    date: string;
    liters: number;
    cost: number;
    route: string;
    driverName: string;
}

// Financial types
export interface FinancialPlan {
    id: string;
    revenueTarget: number;
    collected: number;
    expenseCeilings: { [key in ExpenseCategory]?: number };
    totalExpenses: number;
    startDate: string;
    endDate: string;
    period: 'monthly' | 'quarterly';
    status: 'active' | 'completed';
}

// Audit types
export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
}

// Action Log types
export interface ActionLog {
    id: string;
    userId: string;
    action: string;
    entityType: 'abonent' | 'payment' | 'charge' | 'document' | 'appeal';
    entityId: string;
    details: string;
    timestamp: string;
    ipAddress?: string;
}

// Manual Charge types
export interface ManualCharge {
    id: string;
    abonentId: string;
    amount: number;
    type: ManualChargeType;
    reason: string;
    date: string;
    createdBy: string;
    createdAt: string;
    period?: string; // YYYY-MM для ретроактивных начислений
}

// Bank types
export interface BankTransaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    bankType: BankType;
    accountNumber?: string;
    abonentId?: string; // если сопоставлен
    isConfirmed: boolean;
    matchedBy?: string;
    matchedAt?: string;
    fileAttachment?: string; // путь к файлу
}

// Debt types
export interface DebtCase {
    id: string;
    abonentId: string;
    abonentName: string;
    currentDebt: number;
    debtAgeDays: number;
    status: DebtStatus;
    history: { date: string, action: string }[];
}

// Debt Restructuring types
export interface DebtRestructuring {
    id: string;
    abonentId: string;
    originalDebt: number;
    restructuredAmount: number;
    monthlyPayment: number;
    totalPayments: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'defaulted';
    payments: { date: string; amount: number; status: 'paid' | 'missed' }[];
}

// Company Settings types
export interface CompanySettings {
    name: string;
    address: string;
    phone: string;
    instagram: string;
    receiptTemplate?: string; // выбранный шаблон квитанции
}

// Controller specific types
export interface ControllerAbonent {
    id: string;
    fullName: string;
    address: string;
    balance: number;
}

export interface ControllerRequest {
    id: string;
    type: RequestType;
    abonentName: string;
    status: RequestStatus;
}

export interface ControllerOverviewData {
    stats: {
        totalAbonents: number;
        activeAbonents: number;
        disconnectedAbonents: number;
        pendingRequests: number;
    };
    myAbonents: ControllerAbonent[];
    myRequests: ControllerRequest[];
}

// Плейсхолдеры недостающих экспортируемых типов, чтобы собрать проект
export interface AccountantDashboardData { [key: string]: unknown }
export interface BankStatementTransaction { [key: string]: unknown }
export type ReconciliationStatus = 'unreconciled' | 'partial' | 'reconciled'
export interface RecentTransaction { [key: string]: unknown }
export interface Accrual { [key: string]: unknown }
export interface CheckClosingPayment { [key: string]: unknown }
export interface Employee { [key: string]: unknown }
export interface AbonentPortalData { [key: string]: unknown }
export interface MeterReading { [key: string]: unknown }
export interface CheckNoticeZoneGroup { [key: string]: unknown }