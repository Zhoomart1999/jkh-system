import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Role } from '../../types';
import { 
    HomeIcon, 
    UsersIcon, 
    SlidersIcon, 
    HistoryIcon, 
    DataExchangeIcon, 
    MegaphoneIcon, 
    SettingsIcon, 
    LogOutIcon, 
    WaterIcon,
    FileTextIcon,
    WrenchIcon,
    MapPinIcon,
    ActivityIcon,
    ToolIcon,
    FileSpreadsheetIcon,
    CalendarCheckIcon,
    ReceiptIcon,
    DollarSignIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    CreditCardIcon,
    CalculatorIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    UploadIcon,
    CalendarIcon,
    BellIcon
} from '../ui/Icons';
import AnnouncementBanner from './AnnouncementBanner';
import NotificationCenter from '../NotificationCenter';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    roles: Role[];
}

const navItems: NavItem[] = [
    // Admin
    { path: '/admin/dashboard', label: 'Панель управления', icon: <HomeIcon className="w-5 h-5" />, roles: [Role.Admin] },
    { path: '/admin/users', label: 'Пользователи', icon: <UsersIcon className="w-5 h-5" />, roles: [Role.Admin] },
    { path: '/admin/tariffs', label: 'Тарифы', icon: <SlidersIcon className="w-5 h-5" />, roles: [Role.Admin] },
    { path: '/admin/data-exchange', label: 'Импорт/Экспорт', icon: <DataExchangeIcon className="w-5 h-5" />, roles: [Role.Admin] },
    { path: '/admin/announcements', label: 'Объявления', icon: <MegaphoneIcon className="w-5 h-5" />, roles: [Role.Admin] },
    { path: '/admin/logs', label: 'Аудит', icon: <HistoryIcon className="w-5 h-5" />, roles: [Role.Admin] },
    { path: '/admin/settings', label: 'Настройки', icon: <SettingsIcon className="w-5 h-5" />, roles: [Role.Admin] },
    
    // Engineer & Controller
    { path: '/engineer/dashboard', label: 'Обзор', icon: <HomeIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/abonents', label: 'Абоненты', icon: <UsersIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/requests', label: 'Заявки', icon: <WrenchIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/maintenance', label: 'Обслуживание', icon: <CalendarCheckIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/readings', label: 'Показания', icon: <ActivityIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/inventory', label: 'Склад', icon: <ToolIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/accruals', label: 'Начисления', icon: <FileTextIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/infrastructure', label: 'Зоны', icon: <MapPinIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/reports', label: 'Отчеты', icon: <FileSpreadsheetIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/check-closing', label: 'Закрытие чека', icon: <ReceiptIcon className="w-5 h-5" />, roles: [Role.Engineer, Role.Controller] },
    { path: '/engineer/bulk-readings', label: 'Массовый импорт', icon: <UploadIcon className="w-5 h-5" />, roles: [Role.Engineer] },
    { path: '/engineer/work-scheduler', label: 'Планировщик работ', icon: <CalendarIcon className="w-5 h-5" />, roles: [Role.Engineer] },
    { path: '/engineer/auto-warehouse', label: 'Авто-склад', icon: <ExclamationTriangleIcon className="w-5 h-5" />, roles: [Role.Engineer] },
    { path: '/engineer/water-quality', label: 'Качество воды', icon: <ChartBarIcon className="w-5 h-5" />, roles: [Role.Engineer] },
    
    // Accountant
    { path: '/accountant/dashboard', label: 'Обзор', icon: <HomeIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/payments', label: 'Платежи', icon: <DollarSignIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/expenses', label: 'Расходы', icon: <TrendingDownIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/salaries', label: 'Зарплаты', icon: <UsersIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/budget', label: 'Финансовые планы', icon: <ChartBarIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/reports', label: 'Отчеты', icon: <FileSpreadsheetIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/bank-operations', label: 'Банковские операции', icon: <CreditCardIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/debtors', label: 'Должники', icon: <ExclamationTriangleIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/manual-charges', label: 'Ручные начисления', icon: <CalculatorIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/documents', label: 'Документы', icon: <DocumentTextIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/appeals', label: 'Обращения', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/action-logs', label: 'Журнал действий', icon: <ClockIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/check-closing', label: 'Закрытие чека', icon: <ReceiptIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/auto-penalty', label: 'Авто-пени', icon: <CalculatorIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/debt-restructuring', label: 'Реструктуризация', icon: <CalendarIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/tax-reports', label: 'Налоговые отчеты', icon: <FileTextIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/notifications', label: 'Уведомления', icon: <BellIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/budget-planning', label: 'Бюджетное планирование', icon: <CalculatorIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/profitability', label: 'Анализ рентабельности', icon: <TrendingUpIcon className="w-5 h-5" />, roles: [Role.Accountant] },
    { path: '/accountant/accounts-payable', label: 'Кредиторская задолженность', icon: <DollarSignIcon className="w-5 h-5" />, roles: [Role.Accountant] },
];

const Sidebar: React.FC = () => {
    const auth = useContext(AuthContext);
    const userRole = auth?.user?.role;
    
    const filteredNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
            <div className="h-16 flex items-center justify-center border-b border-slate-200 gap-2">
                <WaterIcon className="w-8 h-8" />
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">GIS-KG</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {filteredNavItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={auth?.logout}
                    className="flex w-full items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                    <LogOutIcon className="w-5 h-5" />
                    <span className="ml-3">Выйти</span>
                </button>
            </div>
        </aside>
    );
};

const Header: React.FC = () => {
    const auth = useContext(AuthContext);
    
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div>
                 {/* Can add breadcrumbs or page title here */}
            </div>
            <div className="flex items-center space-x-4">
                <NotificationCenter />
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold shadow-inner">
                        {auth?.user?.name.charAt(0)}
                    </div>
                    <div className="ml-3 text-left">
                        <p className="text-sm font-semibold text-slate-800">{auth?.user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{auth?.user?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AnnouncementBanner />
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;