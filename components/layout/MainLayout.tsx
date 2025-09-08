import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Role } from '../../types';

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
  roles: Role[];
}

const MainLayout: React.FC = () => {
  const auth = useContext(AuthContext);
  const userRole = auth?.user?.role;

  const adminNavigation: NavItem[] = [
    { name: 'Обзор', to: '/admin/dashboard', icon: '🏠', roles: [Role.Admin] },
    { name: 'Пользователи', to: '/admin/users', icon: '👥', roles: [Role.Admin] },
    { name: 'Объявления', to: '/admin/announcements', icon: '📢', roles: [Role.Admin] },
    { name: 'Аудит', to: '/admin/logs', icon: '📋', roles: [Role.Admin] },
    { name: 'Календарь', to: '/admin/calendar', icon: '📅', roles: [Role.Admin] },
    { name: 'Настройки', to: '/admin/settings', icon: '⚙️', roles: [Role.Admin] },
    { name: 'Импорт/Экспорт', to: '/admin/data-exchange', icon: '📊', roles: [Role.Admin] },
    { name: 'Тарифы', to: '/admin/tariffs', icon: '💰', roles: [Role.Admin] }
  ];

  const engineerNavigation: NavItem[] = [
    { name: 'Обзор', to: '/engineer/dashboard', icon: '🏠', roles: [Role.Engineer, Role.Controller] },
    { name: 'Абоненты', to: '/engineer/abonents', icon: '👥', roles: [Role.Engineer, Role.Controller] },
    { name: 'Заявки', to: '/engineer/requests', icon: '📋', roles: [Role.Engineer, Role.Controller] },
    { name: 'Показания', to: '/engineer/readings', icon: '📊', roles: [Role.Engineer, Role.Controller] },
    { name: 'Обслуживание', to: '/engineer/maintenance', icon: '🔧', roles: [Role.Engineer, Role.Controller] },
    { name: 'Склад', to: '/engineer/inventory', icon: '📦', roles: [Role.Engineer, Role.Controller] },
    { name: 'Начисления', to: '/engineer/accruals', icon: '💰', roles: [Role.Engineer, Role.Controller] },
    { name: 'Зоны', to: '/engineer/infrastructure', icon: '🗺️', roles: [Role.Engineer, Role.Controller] },
    { name: 'Отчеты', to: '/engineer/reports', icon: '📈', roles: [Role.Engineer, Role.Controller] },
    { name: 'Закрытие чека', to: '/engineer/check-closing', icon: '✅', roles: [Role.Engineer, Role.Controller] },
    { name: 'Массовый импорт', to: '/engineer/bulk-readings', icon: '📥', roles: [Role.Engineer, Role.Controller] },
    { name: 'Планировщик работ', to: '/engineer/work-scheduler', icon: '📅', roles: [Role.Engineer, Role.Controller] },
    { name: 'Календарь', to: '/engineer/calendar', icon: '📆', roles: [Role.Engineer, Role.Controller] },
    { name: 'Авто-склад', to: '/engineer/auto-warehouse', icon: '🚗', roles: [Role.Engineer, Role.Controller] },
    { name: 'Качество воды', to: '/engineer/water-quality', icon: '💧', roles: [Role.Engineer, Role.Controller] }
  ];

  const accountantNavigation: NavItem[] = [
    { name: 'Обзор', to: '/accountant/dashboard', icon: '🏠', roles: [Role.Accountant] },
    { name: 'Платежи', to: '/accountant/payments', icon: '💰', roles: [Role.Accountant] },
    { name: 'Расходы', to: '/accountant/expenses', icon: '📊', roles: [Role.Accountant] },
    { name: 'Зарплаты', to: '/accountant/salaries', icon: '👷', roles: [Role.Accountant] },
    { name: 'Банковские операции', to: '/accountant/bank-operations', icon: '🏦', roles: [Role.Accountant] },
    { name: 'Отчеты', to: '/accountant/reports', icon: '📈', roles: [Role.Accountant] },
    { name: 'Закрытие чеков', to: '/accountant/check-closing', icon: '✅', roles: [Role.Accountant] },
    { name: 'Ручные начисления', to: '/accountant/manual-charges', icon: '✏️', roles: [Role.Accountant] },
    { name: 'Документы', to: '/accountant/documents', icon: '📄', roles: [Role.Accountant] },
    { name: 'Обращения', to: '/accountant/appeals', icon: '📝', roles: [Role.Accountant] },
    { name: 'Журнал действий', to: '/accountant/action-logs', icon: '📋', roles: [Role.Accountant] },
    { name: 'Авто-пеня', to: '/accountant/auto-penalty', icon: '⚠️', roles: [Role.Accountant] },
    { name: 'Реструктуризация долгов', to: '/accountant/debt-restructuring', icon: '🔄', roles: [Role.Accountant] },
    { name: 'Налоговые отчеты', to: '/accountant/tax-reports', icon: '🧾', roles: [Role.Accountant] },
    { name: 'Уведомления', to: '/accountant/notifications', icon: '🔔', roles: [Role.Accountant] },
    { name: 'Бюджетное планирование', to: '/accountant/budget-planning', icon: '📊', roles: [Role.Accountant] },
    { name: 'Анализ прибыльности', to: '/accountant/profitability', icon: '📈', roles: [Role.Accountant] },
    { name: 'Кредиторская задолженность', to: '/accountant/accounts-payable', icon: '💳', roles: [Role.Accountant] },
    { name: 'Должники', to: '/accountant/debtors', icon: '👥', roles: [Role.Accountant] },
    { name: 'Бюджет', to: '/accountant/budget', icon: '💼', roles: [Role.Accountant] }
  ];

  let navigation: NavItem[] = [];
  let title = '';

  if (userRole === Role.Admin) {
    navigation = adminNavigation;
    title = 'Админ панель';
  } else if (userRole === Role.Engineer || userRole === Role.Controller) {
    navigation = engineerNavigation;
    title = 'Инженерная панель';
  } else if (userRole === Role.Accountant) {
    navigation = accountantNavigation;
    title = 'Бухгалтерская панель';
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole as Role)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
          <nav className="mt-6">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Logout button */}
          <div className="mt-auto p-6">
            <button 
              onClick={() => auth?.logout?.()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;