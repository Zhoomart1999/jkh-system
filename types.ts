export enum Role {
    Admin = 'admin',
    Engineer = 'engineer',
    Accountant = 'accountant',
    Controller = 'controller',
}

export interface User {
    id: string;
    name: string;
    role: Role;
    pin: string;
    isActive: boolean;
}

export enum BuildingType {
    Private = 'private',
    Apartment = 'apartment',
}

export enum WaterTariffType {
    ByMeter = 'by_meter',
    ByPerson = 'by_person',
}

export enum AbonentStatus {
    Active = 'active',
    Disconnected = 'disconnected',
    Archived = 'archived',
}

export interface Abonent {
    id: string;
    fullName: string;
    address: string;
    phone: string;
    numberOfPeople: number;
    buildingType: BuildingType;
    waterTariff: WaterTariffType;
    status: AbonentStatus;
    balance: number;
    createdAt: string;
    zoneId?: string;
    hasGarden: boolean;
    gardenSize?: number; // 1, 0.5, 0.3, 0.2
    controllerId?: string;
    lastPenaltyDate?: string;
    personalAccount?: string;
    password?: string;
    hasWaterService?: boolean;
    hasGarbageService?: boolean;
    lastMeterReading?: number;
    currentMeterReading?: number;
    meterReadingMonth?: string; // YYYY-MM
    isImportedDebt?: boolean;
    riskOfDisconnection?: boolean;
    billingBlocked?: boolean;
    debtPaymentPlanId?: string;
    lastAppealDate?: string;
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

export enum PaymentMethod {
    Cash = 'cash',
    Bank = 'bank',
    Card = 'card',
    QR = 'qr',
    System = 'system' // For payments made through the system by accountant
}

export interface Payment {
    id: string;
    abonentId: string;
    abonentName: string;
    amount: number;
    date: string;
    method: PaymentMethod;
    paymentMethod: string;
    collectorId: string;
    recordedByName: string;
    bankType?: BankType;
    comment?: string;
    recordedBy: string;
    attachmentPath?: string; // путь к прикрепленному файлу
    isPartial?: boolean; // частичная оплата
    relatedPaymentId?: string; // для связывания частичных оплат
}

export interface Accrual {
    id: string;
    abonentId: string;
    amount: number;
    date: string;
    type: 'auto' | 'manual';
    notes?: string;
    editorId?: string; // Who made a manual correction
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
}

export enum ExpenseCategory {
    Salaries = 'salaries',
    Fuel = 'fuel',
    Repairs = 'repairs',
    Maintenance = 'maintenance',
    Office = 'office',
    Taxes = 'taxes',
}

export const ExpenseCategoryLabels: { [key in ExpenseCategory]: string } = {
    [ExpenseCategory.Salaries]: 'Зарплаты',
    [ExpenseCategory.Fuel]: 'Топливо (ГСМ)',
    [ExpenseCategory.Repairs]: 'Ремонт техники',
    [ExpenseCategory.Maintenance]: 'Обслуживание инфраструктуры',
    [ExpenseCategory.Office]: 'Административные расходы',
    [ExpenseCategory.Taxes]: 'Налоги',
};


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

export interface StaffSalary {
    id: string;
    userId: string;
    name: string;
    role: Role;
    monthlySalary: number;
    lastPaidDate: string | null;
}

export interface FuelLog {
    id: string;
    truckId: string;
    date: string;
    liters: number;
    cost: number;
    route: string;
    driverName: string;
}

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


export interface AbonentHistory {
    payments: Payment[];
    accruals: Accrual[];
}

export interface PaymentSummary {
    count: number;
    totalAmount: number;
}

// --- Engineer specific types ---

export enum GISObjectType {
    Pipe = 'pipe',
    Valve = 'valve',
    Hydrant = 'hydrant',
    Abonent = 'abonent',
}
export interface GISObject {
    id: string;
    type: GISObjectType;
    name: string;
    gridPosition: { row: number; col: number };
    status: 'ok' | 'warning' | 'error';
    lat?: number;
    lng?: number;
}

export enum MaintenanceStatus {
    Planned = 'planned',
    InProgress = 'in_progress',
    Completed = 'completed',
    Overdue = 'overdue',
}
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

export interface WaterQualitySample {
    id: string;
    location: string; 
    date: string;
    ph: number; // Normal 6.5-8.5
    chlorine: number; // Normal 0.2-0.5 mg/L
    turbidity: number; // Normal < 1 NTU
}

export interface MeterReading {
    id: string;
    abonentId: string;
    date: string;
    value: number;
    isAbnormal?: boolean;
}

export enum RequestType {
    Connection = 'connection',
    Disconnection = 'disconnection',
    MeterReplacement = 'meter_replacement',
    LeakReport = 'leak_report',
}

export const RequestTypeLabels: { [key in RequestType]: string } = {
    [RequestType.Connection]: 'Подключение',
    [RequestType.Disconnection]: 'Отключение',
    [RequestType.MeterReplacement]: 'Замена счетчика',
    [RequestType.LeakReport]: 'Сообщение об утечке',
};

export enum RequestStatus {
    New = 'new',
    InProgress = 'in_progress',
    Resolved = 'resolved',
    Cancelled = 'cancelled',
}

export const RequestStatusLabels: { [key in RequestStatus]: string } = {
    [RequestStatus.New]: 'Новая',
    [RequestStatus.InProgress]: 'В работе',
    [RequestStatus.Resolved]: 'Выполнена',
    [RequestStatus.Cancelled]: 'Отменена',
};

export enum RequestPriority {
    Normal = 'normal',
    High = 'high',
    Critical = 'critical',
}

export const RequestPriorityLabels: { [key in RequestPriority]: string } = {
    [RequestPriority.Normal]: 'Обычный',
    [RequestPriority.High]: 'Высокий',
    [RequestPriority.Critical]: 'Критический',
};

export interface WorkOrderDetails {
    completedAt?: string;
    hoursSpent?: number;
    notes?: string;
    usedMaterials?: { itemId: string; name: string; unit: string; quantity: number }[];
    photos?: { before: string; after: string }; // Base64 encoded images
    history?: { date: string; action: string; userName: string; }[];
}

export interface TechnicalRequest {
    id: string;
    abonentId: string;
    abonentName: string;
    abonentAddress: string;
    type: RequestType;
    status: RequestStatus;
    priority: RequestPriority;
    createdAt: string;
    details: string;
    assignedToId?: string;
    assignedToName?: string;
    workOrder?: WorkOrderDetails;
}

export interface InfrastructureZone {
    id: string;
    name: string;
    gridPosition?: { row: number; col: number };
}

export interface InventoryItem {
    id: string;
    name: string;
    unit: string; // e.g., 'шт.', 'м.'
    quantity: number;
    lowStockThreshold: number;
}

// --- Receipt specific types ---
export interface ReceiptChargeItem {
    name: string;
    debt?: number;
    paid?: number;
    consumption?: string;
    accrued: number;
    tax?: number;
    recalculation?: number;
    penalty?: number;
    total: number;
}

export interface ReceiptDetails {
    abonent: Abonent;
    period: string; // e.g., "Январь 2025"
    personalAccount: string; // лицевой счет
    controllerName: string;
    companySettings: CompanySettings;

    waterService?: {
        charges: ReceiptChargeItem;
        prevReading?: number;
        currentReading?: number;
    };
    
    garbageService?: {
        charges: ReceiptChargeItem;
    };
    
    totalToPay: number;
}

// --- Check Notice specific types ---
export interface CheckNoticeAbonent {
  id: string;
  fullName: string;
  address: string;
  hasDebt: boolean;
  balance: number;
}

export interface CheckNoticeZoneGroup {
  zoneId: string;
  zoneName: string;
  abonents: CheckNoticeAbonent[];
}

// --- Admin specific types ---
export interface CompanySettings {
    name: string;
    address: string;
    phone: string;
    instagram: string;
    receiptTemplate?: string; // выбранный шаблон квитанции
}

export interface Announcement {
    id:string;
    title: string;
    content: string;
    isActive: boolean;
    createdAt: string;
    notifySubscribers?: boolean;
}

export interface AdminDashboardData {
    totalAbonents: number;
    totalUsers: number;
    totalDebt: number;
    recentLogs: AuditLog[];
    abonentStatusDistribution: { name: string; value: number }[];
    topControllers: { name: string; count: number }[];
}

// --- Accountant specific types ---
export enum ReconciliationStatus {
    Unmatched = 'unmatched',
    Matched = 'matched',
    Manual = 'manual',
}
export interface BankStatementTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: ReconciliationStatus;
    matchedPaymentId?: string;
    bankType: BankType;
    isConfirmed: boolean;
    abonentId?: string;
    matchedAt?: string;
}

export enum DebtStatus {
    Monitoring = 'monitoring',
    WarningSent = 'warning_sent',
    PreLegal = 'pre_legal',
    LegalAction = 'legal_action',
    Closed = 'closed',
}

export const DebtStatusLabels: { [key in DebtStatus]: string } = {
    [DebtStatus.Monitoring]: 'Мониторинг',
    [DebtStatus.WarningSent]: 'Предупреждение отправлено',
    [DebtStatus.PreLegal]: 'Досудебная претензия',
    [DebtStatus.LegalAction]: 'Передано в суд',
    [DebtStatus.Closed]: 'Закрыто',
};

export interface DebtCase {
    id: string;
    abonentId: string;
    abonentName: string;
    currentDebt: number;
    debtAgeDays: number;
    status: DebtStatus;
    history: { date: string, action: string }[];
}

export interface RecentTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
}

export interface AccountantDashboardData {
    paymentsToday: number;
    totalPaidThisMonth: number;
    totalDebt: number;
    revenueVsExpense: { name: string; revenue: number; expense: number }[];
    recentTransactions: RecentTransaction[];
}

export interface ExpenseBreakdown {
    category: ExpenseCategory;
    amount: number;
    count: number;
}
export interface ExpenseReportData {
    totalExpenses: number;
    breakdown: ExpenseBreakdown[];
}

export interface IncomeBreakdown {
    method: PaymentMethod;
    amount: number;
    count: number;
}
export interface IncomeReportData {
    totalIncome: number;
    breakdown: IncomeBreakdown[];
}


export interface TurnoverSheetRow {
    abonentId: string;
    abonentName: string;
    startBalance: number;
    debit: number; // Accruals
    credit: number; // Payments
    endBalance: number;
}

export interface CashierReportData {
    collectorName: string;
    period: string;
    payments: Payment[];
    totalCollected: number;
}


// --- Controller specific types ---
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

export interface DebtorsReportItem {
    id: string;
    fullName: string;
    address: string;
    phone: string;
    balance: number;
}

export interface UsedMaterialReportItem {
    itemId: string;
    name: string;
    unit: string;
    quantity: number;
}

// --- System-wide types ---
export enum SystemNotificationType {
    NewUser = 'new_user',
    TaskAssigned = 'task_assigned',
    CriticalTask = 'critical_task',
    LowStock = 'low_stock',
    PaymentReversed = 'payment_reversed',
}

export interface SystemNotification {
    id: string;
    type: SystemNotificationType;
    message: string;
    isRead: boolean;
    createdAt: string;
    recipientId?: string; // For user-specific notifications
}

// --- Abonent Portal Types ---
export interface AbonentPortalData {
    abonent: Abonent;
    history: AbonentHistory;
    readings: MeterReading[];
}

// --- Банковская интеграция для Кыргызстана ---

export enum BankType {
    KICB = 'kicb',
    Demir = 'demir',
    MBank = 'mbank',
    Bakai = 'bakai',
    Other = 'other'
}

export enum PaymentStatus {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
    Reversed = 'reversed',
}

export interface BankPayment {
    id: string;
    abonentId: string;
    abonentName: string;
    amount: number;
    bankType: BankType;
    paymentMethod: 'card' | 'qr' | 'app' | 'transfer';
    status: PaymentStatus;
    transactionId?: string; // ID транзакции в банке
    createdAt: string;
    completedAt?: string;
    bankCommission?: number;
    description?: string;
    qrCode?: string; // QR код для оплаты
    receiptUrl?: string; // Ссылка на чек от банка
}

export interface BankIntegration {
    bankType: BankType;
    isActive: boolean;
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    testMode: boolean;
    lastSync?: string;
    settings: {
        autoReconciliation: boolean;
        commissionRate: number;
        minAmount: number;
        maxAmount: number;
        supportedMethods: string[];
    };
}

export interface BankStatement {
    id: string;
    bankType: BankType;
    date: string;
    transactions: BankTransaction[];
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

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

export interface QRCodePayment {
    id: string;
    abonentId: string;
    amount: number;
    bankType: BankType;
    qrCode: string;
    expiresAt: string;
    status: 'active' | 'paid' | 'expired';
    paymentId?: string;
}

export interface BankReconciliation {
    id: string;
    bankType: BankType;
    date: string;
    totalTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
    totalAmount: number;
    matchedAmount: number;
    unmatchedAmount: number;
    status: 'pending' | 'completed' | 'error';
    details: BankReconciliationDetail[];
}

export interface BankReconciliationDetail {
    bankTransaction: BankTransaction;
    systemPayment?: Payment;
    status: 'matched' | 'unmatched' | 'manual';
    difference?: number;
    notes?: string;
}

export interface BankReport {
    bankType: BankType;
    period: string;
    totalPayments: number;
    totalAmount: number;
    totalCommission: number;
    paymentsByMethod: { method: string; count: number; amount: number }[];
    dailyStats: { date: string; count: number; amount: number }[];
}

// --- Специфичные типы для ЖКХ Кыргызстана ---

export enum PenaltyType {
    LatePayment = 'late_payment',
    NoMeter = 'no_meter',
    IllegalConnection = 'illegal_connection',
}

export interface Penalty {
    id: string;
    abonentId: string;
    type: PenaltyType;
    amount: number;
    reason: string;
    appliedAt: string;
    isPaid: boolean;
    paidAt?: string;
    paymentId?: string;
}

export enum SubsidyType {
    MultiChild = 'multi_child',
    Pensioner = 'pensioner',
    Disabled = 'disabled',
    Veteran = 'veteran',
    LowIncome = 'low_income',
}

export interface Subsidy {
    id: string;
    abonentId: string;
    type: SubsidyType;
    percentage: number; // Процент льготы
    amount: number; // Фиксированная сумма
    startDate: string;
    endDate?: string;
    isActive: boolean;
    documentNumber?: string;
    approvedBy?: string;
    approvedAt?: string;
}

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

export interface LegalCase {
    id: string;
    abonentId: string;
    caseNumber: string;
    courtName: string;
    debtAmount: number;
    filingDate: string;
    status: 'filed' | 'hearing' | 'judgment' | 'execution' | 'closed';
    nextHearing?: string;
    judgmentDate?: string;
    judgmentAmount?: number;
    executorName?: string;
    notes?: string;
}

// --- Уведомления и коммуникации ---

export enum NotificationType {
    PaymentReceived = 'payment_received',
    PaymentFailed = 'payment_failed',
    DebtWarning = 'debt_warning',
    ServiceDisconnection = 'service_disconnection',
    ServiceRestoration = 'service_restoration',
    NewTariff = 'new_tariff',
    MaintenanceScheduled = 'maintenance_scheduled',
}

export interface Notification {
    id: string;
    abonentId?: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    sentVia: 'sms' | 'email' | 'push' | 'system';
    deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
    metadata?: Record<string, any>;
}

export interface SMSTemplate {
    id: string;
    type: NotificationType;
    title: string;
    template: string;
    variables: string[]; // Список переменных в шаблоне
    isActive: boolean;
}

export interface EmailTemplate {
    id: string;
    type: NotificationType;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
}

// --- Экспорт и интеграции ---

export enum ExportFormat {
    Excel = 'excel',
    PDF = 'pdf',
    CSV = 'csv',
    JSON = 'json',
}

export interface ExportJob {
    id: string;
    type: 'payments' | 'accruals' | 'debtors' | 'bank_reconciliation' | 'custom';
    format: ExportFormat;
    filters: Record<string, any>;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    completedAt?: string;
    downloadUrl?: string;
    errorMessage?: string;
}

export interface IntegrationLog {
    id: string;
    integrationType: 'bank' | '1c' | 'nsi' | 'grs';
    action: 'import' | 'export' | 'sync';
    status: 'success' | 'error' | 'partial';
    recordsProcessed: number;
    recordsFailed: number;
    startedAt: string;
    completedAt?: string;
    errorMessage?: string;
    details?: Record<string, any>;
}

// Новые типы для расширенных функций бухгалтера
export enum ManualChargeType {
    Penalty = 'penalty',
    Adjustment = 'adjustment',
    Retroactive = 'retroactive',
    Other = 'other'
}

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

export interface Document {
    id: string;
    abonentId?: string;
    type: 'receipt' | 'contract' | 'notice' | 'payment_proof' | 'other';
    fileName: string;
    filePath: string;
    uploadedBy: string;
    uploadedAt: string;
    description?: string;
}

export interface AbonentAppeal {
    id: string;
    abonentId: string;
    type: 'billing_error' | 'recalculation_request' | 'complaint' | 'question' | 'other';
    subject: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    resolvedBy?: string;
    resolvedAt?: string;
    resolution?: string;
}

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

export interface DebtPaymentPlan {
    id: string;
    abonentId: string;
    totalDebt: number;
    monthlyPayment: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'overdue';
    createdBy: string;
    createdAt: string;
}

export interface BulkCharge {
    id: string;
    description: string;
    amount: number;
    serviceType: 'water' | 'garbage' | 'both';
    targetAbonents: string[]; // IDs
    period: string; // YYYY-MM
    createdBy: string;
    createdAt: string;
    status: 'pending' | 'applied' | 'cancelled';
}

// --- Check Closing Types ---

export interface CheckClosingPayment {
    paymentId: string;
    abonentId: string;
    abonentName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
    isBankPayment: boolean;
    bankType?: BankType;
    comment?: string;
}

export interface CheckClosing {
    id: string;
    date: string;
    controllerId: string;
    controllerName: string;
    closedBy: string; // ID пользователя, который закрыл чек
    closedByName: string;
    totalAmount: number;
    payments: CheckClosingPayment[];
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
    createdAt: string;
    confirmedAt?: string;
    confirmedBy?: string;
}

export interface CheckClosingSummary {
    totalPayments: number;
    totalAmount: number;
    paymentsByMethod: { method: PaymentMethod; count: number; amount: number }[];
    bankPayments: { bankType: BankType; count: number; amount: number }[];
    controllerPayments: { controllerId: string; controllerName: string; count: number; amount: number }[];
}

export interface CheckClosingFormData {
    date: string;
    controllerId: string;
    payments: CheckClosingPayment[];
    notes?: string;
}