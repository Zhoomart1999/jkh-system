import React, { useState, useEffect, useContext } from 'react';
import { api } from "../../services/mock-api"
import { AccountantDashboardData, Role, User, Payment, PaymentMethod, Expense, ExpenseCategory, StaffSalary, FuelLog, FinancialPlan, BankStatementTransaction, ReconciliationStatus, DebtCase, DebtStatus } from '../../types';
import Card from '../../components/ui/Card';
import { AuthContext } from '../../context/AuthContext';
import { 
    DollarSignIcon, 
    TrendingUpIcon, 
    TrendingDownIcon, 
    UsersIcon,
    FileTextIcon,
    CreditCardIcon,
    CalculatorIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    DownloadIcon,
    UploadIcon,
    CheckIcon,
    BellIcon
} from '../../components/ui/Icons';

const AccountantDashboard: React.FC = () => {
    const [data, setData] = useState<AccountantDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await api.getAccountantDashboardData();
                setData(dashboardData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64">Загрузка...</div>;
    if (!data) return <div className="text-red-500">Ошибка загрузки данных</div>;

    const tabs = [
        { id: 'overview', name: 'Обзор', icon: TrendingUpIcon },
        { id: 'payments', name: 'Платежи', icon: DollarSignIcon },
        { id: 'expenses', name: 'Расходы', icon: TrendingDownIcon },
        { id: 'salaries', name: 'Зарплаты', icon: UsersIcon },
        { id: 'fuel', name: 'ГСМ', icon: FileTextIcon },
        { id: 'financial-plans', name: 'Финансовые планы', icon: ChartBarIcon },
        { id: 'reports', name: 'Отчеты', icon: FileTextIcon },
        { id: 'bank-operations', name: 'Банковские операции', icon: CreditCardIcon },
        { id: 'debtors', name: 'Должники', icon: ExclamationTriangleIcon },
        { id: 'manual-charges', name: 'Ручные начисления', icon: CalculatorIcon },
        { id: 'documents', name: 'Документы', icon: DocumentTextIcon },
        { id: 'appeals', name: 'Обращения', icon: ChatBubbleLeftRightIcon },
        { id: 'action-logs', name: 'Журнал действий', icon: ClockIcon },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab data={data} />;
            case 'payments':
                return <PaymentsTab />;
            case 'expenses':
                return <ExpensesTab />;
            case 'salaries':
                return <SalariesTab />;
            case 'fuel':
                return <FuelTab />;
            case 'financial-plans':
                return <FinancialPlansTab />;
            case 'reports':
                return <ReportsTab />;
            case 'bank-operations':
                return <BankOperationsTab />;
            case 'debtors':
                return <DebtorsTab />;
            case 'manual-charges':
                return <ManualChargesTab />;
            case 'documents':
                return <DocumentsTab />;
            case 'appeals':
                return <AppealsTab />;
            case 'action-logs':
                return <ActionLogsTab />;
            default:
                return <OverviewTab data={data} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Панель бухгалтера</h1>
                <div className="text-sm text-gray-500">
                    Добро пожаловать, {user?.name}
                </div>
            </div>

            {/* Вкладки */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Содержимое вкладки */}
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

// Компонент обзора
const OverviewTab: React.FC<{ data: AccountantDashboardData }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <DollarSignIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Платежи сегодня
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {data.paymentsToday}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingUpIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Поступления за месяц
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {data.totalPaidThisMonth.toLocaleString()} сом
                                </dd>
                            </dl>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingDownIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Общая задолженность
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {data.totalDebt.toLocaleString()} сом
                                </dd>
                            </dl>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UsersIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Активных абонентов
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {data.recentTransactions.length}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </Card>
            </div>

            {/* График доходов и расходов */}
            <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Доходы и расходы за 6 месяцев</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                    {data.revenueVsExpense.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex flex-col space-y-1">
                                <div 
                                    className="bg-green-500 rounded-t"
                                    style={{ height: `${(item.revenue / Math.max(...data.revenueVsExpense.map(d => d.revenue))) * 120}px` }}
                                ></div>
                                <div 
                                    className="bg-red-500 rounded-t"
                                    style={{ height: `${(item.expense / Math.max(...data.revenueVsExpense.map(d => d.expense))) * 120}px` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-2">{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-600">Доходы</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-600">Расходы</span>
                    </div>
                </div>
            </Card>

            {/* Последние транзакции */}
            <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Последние транзакции</h3>
                <div className="space-y-3">
                    {data.recentTransactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-3 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                                </div>
                            </div>
                            <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} сом
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// Вкладка платежей
const PaymentsTab: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await api.getPayments();
                setPayments(data);
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div>Загрузка платежей...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Управление платежами</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Добавить платеж
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <DownloadIcon className="w-4 h-4" />
                        Экспорт
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Абонент</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Метод</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.slice(0, 10).map((payment) => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.abonentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.amount.toLocaleString()} сом</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString('ru-RU')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                ✏️
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Вкладка расходов
const ExpensesTab: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await api.getExpenses();
                setExpenses(data);
            } catch (error) {
                console.error('Failed to fetch expenses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    if (loading) return <div>Загрузка расходов...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Управление расходами</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Добавить расход
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4" />
                        Аналитика
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">По категориям</h3>
                    <div className="space-y-3">
                        {Object.values(ExpenseCategory).map((category) => {
                            const categoryExpenses = expenses.filter(e => e.category === category);
                            const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                            return (
                                <div key={category} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{category}</span>
                                    <span className="text-sm font-medium">{total.toLocaleString()} сом</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Последние расходы</h3>
                    <div className="space-y-3">
                        {expenses.slice(0, 5).map((expense) => (
                            <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                    <p className="text-sm font-medium">{expense.description}</p>
                                    <p className="text-xs text-gray-500">{expense.category}</p>
                                </div>
                                <span className="text-sm font-medium text-red-600">{expense.amount.toLocaleString()} сом</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
                    <div className="space-y-2">
                        <button className="w-full btn-secondary text-left flex items-center gap-2">
                            🚛 Добавить ГСМ
                        </button>
                        <button className="w-full btn-secondary text-left flex items-center gap-2">
                            👥 Выплатить зарплату
                        </button>
                        <button className="w-full btn-secondary text-left flex items-center gap-2">
                            🔧 Ремонтные работы
                        </button>
                        <button className="w-full btn-secondary text-left flex items-center gap-2">
                            <BellIcon className="w-4 h-4" />
                            Коммунальные услуги
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Вкладка зарплат
const SalariesTab: React.FC = () => {
    const [salaries, setSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalaries = async () => {
            try {
                const data = await api.getStaffSalaries();
                setSalaries(data);
            } catch (error) {
                console.error('Failed to fetch salaries:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalaries();
    }, []);

    if (loading) return <div>Загрузка зарплат...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Управление зарплатами</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Добавить сотрудника
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <DownloadIcon className="w-4 h-4" />
                        Ведомость
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сотрудник</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Должность</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Зарплата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Последняя выплата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salaries.map((salary) => (
                                <tr key={salary.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{salary.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salary.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{salary.monthlySalary.toLocaleString()} сом</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {salary.lastPaidDate ? new Date(salary.lastPaidDate).toLocaleDateString('ru-RU') : 'Не выплачивалась'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-green-600 hover:text-green-900">
                                                <DollarSignIcon className="w-4 h-4" />
                                            </button>
                                            <button className="text-blue-600 hover:text-blue-900">
                                                ✏️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Вкладка ГСМ
const FuelTab: React.FC = () => {
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFuelLogs = async () => {
            try {
                const data = await api.getFuelLogs();
                setFuelLogs(data);
            } catch (error) {
                console.error('Failed to fetch fuel logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFuelLogs();
    }, []);

    if (loading) return <div>Загрузка ГСМ...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Учет ГСМ</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Добавить заправку
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4" />
                        Статистика
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер машины</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Литры</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стоимость</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Маршрут</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Водитель</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fuelLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.date).toLocaleDateString('ru-RU')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.truckId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.liters} л</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.cost.toLocaleString()} сом</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.route}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.driverName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                ✏️
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Вкладка финансовых планов
const FinancialPlansTab: React.FC = () => {
    const [plans, setPlans] = useState<FinancialPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await api.getFinancialPlans();
                setPlans(data);
            } catch (error) {
                console.error('Failed to fetch financial plans:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) return <div>Загрузка планов...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Финансовые планы</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Создать план
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4" />
                        Аналитика
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">План {plan.period}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {plan.status === 'active' ? 'Активный' : 'Завершен'}
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Цель по доходам:</span>
                                <span className="text-sm font-medium">{plan.revenueTarget.toLocaleString()} сом</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Собрано:</span>
                                <span className="text-sm font-medium text-green-600">{plan.collected.toLocaleString()} сом</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Расходы:</span>
                                <span className="text-sm font-medium text-red-600">{plan.totalExpenses.toLocaleString()} сом</span>
                            </div>
                            
                            <div className="pt-3 border-t">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{new Date(plan.startDate).toLocaleDateString('ru-RU')}</span>
                                    <span>{new Date(plan.endDate).toLocaleDateString('ru-RU')}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                            <button className="btn-secondary flex-1 text-sm">
                                ✏️
                            </button>
                            <button className="btn-secondary flex-1 text-sm">
                                <ChartBarIcon className="w-4 h-4" />
                            </button>
                            <button className="btn-secondary flex-1 text-sm">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// Вкладка банковских операций
const BankOperationsTab: React.FC = () => {
    const [transactions, setTransactions] = useState<BankStatementTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await api.getBankTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch bank transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) return <div>Загрузка банковских операций...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Банковские операции</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <UploadIcon className="w-4 h-4" />
                        Импорт выписки
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        Сверка
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(transaction.date).toLocaleDateString('ru-RU')}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.amount.toLocaleString()} сом</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            transaction.status === ReconciliationStatus.Matched 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {transaction.status === ReconciliationStatus.Matched ? 'Сопоставлено' : 'Не сопоставлено'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Вкладка должников
const DebtorsTab: React.FC = () => {
    const [debtCases, setDebtCases] = useState<DebtCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebtCases = async () => {
            try {
                const data = await api.getDebtCases();
                setDebtCases(data);
            } catch (error) {
                console.error('Failed to fetch debt cases:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDebtCases();
    }, []);

    if (loading) return <div>Загрузка должников...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Управление должниками</h2>
                <div className="flex space-x-3">
                    <button className="btn-primary flex items-center gap-2">
                        <BellIcon className="w-4 h-4" />
                        Отправить уведомления
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        📄 Отчет
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Абонент</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Задолженность</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дней просрочки</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {debtCases.map((debtCase) => (
                                <tr key={debtCase.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{debtCase.abonentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{Math.abs(debtCase.currentDebt).toLocaleString()} сом</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{debtCase.debtAgeDays}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            debtCase.status === DebtStatus.WarningSent 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {debtCase.status === DebtStatus.WarningSent ? 'Предупреждение отправлено' : 'Мониторинг'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                <BellIcon className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Простые заглушки для новых вкладок
const ManualChargesTab: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Ручные начисления</h2>
            <button className="btn-primary flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Добавить начисление
            </button>
        </div>
        <Card>
            <div className="text-center py-12">
                <CalculatorIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Ручные начисления</h3>
                <p className="mt-1 text-sm text-gray-500">Функция для создания индивидуальных начислений абонентам</p>
            </div>
        </Card>
    </div>
);

const DocumentsTab: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Документы</h2>
            <button className="btn-primary flex items-center gap-2">
                <UploadIcon className="w-4 h-4" />
                Загрузить документ
            </button>
        </div>
        <Card>
            <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Управление документами</h3>
                <p className="mt-1 text-sm text-gray-500">Загрузка и управление документами абонентов</p>
            </div>
        </Card>
    </div>
);

const AppealsTab: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Обращения</h2>
            <button className="btn-primary flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Новое обращение
            </button>
        </div>
        <Card>
            <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Обращения абонентов</h3>
                <p className="mt-1 text-sm text-gray-500">Обработка обращений и жалоб от абонентов</p>
            </div>
        </Card>
    </div>
);

const ReportsTab: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Отчеты</h2>
            <div className="flex space-x-3">
                <button className="btn-secondary flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Экспорт
                </button>
                <button className="btn-primary flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4" />
                    Создать отчет
                </button>
            </div>
        </div>
        <Card>
            <div className="text-center py-12">
                <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Финансовые отчеты</h3>
                <p className="mt-1 text-sm text-gray-500">Создание и экспорт различных финансовых отчетов</p>
            </div>
        </Card>
    </div>
);

const ActionLogsTab: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Журнал действий</h2>
            <button className="btn-secondary flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                Экспорт логов
            </button>
        </div>
        <Card>
            <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Журнал действий</h3>
                <p className="mt-1 text-sm text-gray-500">Детальное логирование всех операций в системе</p>
            </div>
        </Card>
    </div>
);

export default AccountantDashboard;