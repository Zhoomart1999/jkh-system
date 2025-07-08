
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { PortalAuthContext } from '../../context/PortalAuthContext';
import { HomeIcon, ActivityIcon, HistoryIcon, UsersIcon, LogOutIcon } from '../ui/Icons';

const PortalHeader: React.FC = () => {
    const auth = useContext(PortalAuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate('/portal/login');
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-blue-600">Личный кабинет</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold">{auth?.abonent?.fullName}</p>
                            <p className="text-xs text-slate-500">Л/с: {auth?.abonent?.personalAccount}</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
                            <LogOutIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const PortalLayout: React.FC = () => {
    const navItems = [
        { path: 'dashboard', label: 'Главная', icon: <HomeIcon className="w-5 h-5"/> },
        { path: 'readings', label: 'Показания', icon: <ActivityIcon className="w-5 h-5"/> },
        { path: 'history', label: 'История', icon: <HistoryIcon className="w-5 h-5"/> },
        { path: 'profile', label: 'Профиль', icon: <UsersIcon className="w-5 h-5"/> },
    ];
    return (
        <div className="min-h-screen bg-slate-100">
            <PortalHeader />
            <nav className="bg-white border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex space-x-4">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                             className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`
                            }
                        >
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default PortalLayout;