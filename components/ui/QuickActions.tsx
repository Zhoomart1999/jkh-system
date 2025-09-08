import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { 
    UsersIcon, 
    WrenchIcon, 
    MapPinIcon, 
    ActivityIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon
} from './Icons';

interface QuickAction {
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    color: string;
}

const QuickActions: React.FC = () => {
    const actions: QuickAction[] = [
        {
            title: 'Прием платежей',
            description: 'Принять платеж от абонента',
            icon: <CurrencyDollarIcon className="w-6 h-6" />,
            link: '/engineer/payment-collection',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            title: 'Абоненты',
            description: 'Управление абонентами',
            icon: <UsersIcon className="w-6 h-6" />,
            link: '/engineer/abonents',
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            title: 'Заявки',
            description: 'Технические заявки',
            icon: <WrenchIcon className="w-6 h-6" />,
            link: '/engineer/requests',
            color: 'bg-amber-500 hover:bg-amber-600'
        },
        {
            title: 'Показания',
            description: 'Ввод показаний счетчиков',
            icon: <ActivityIcon className="w-6 h-6" />,
            link: '/engineer/readings',
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            title: 'Карта',
            description: 'Интерактивная карта',
            icon: <MapPinIcon className="w-6 h-6" />,
            link: '/engineer/map',
            color: 'bg-red-500 hover:bg-red-600'
        },
        {
            title: 'Квитанции',
            description: 'Печать квитанций',
            icon: <DocumentTextIcon className="w-6 h-6" />,
            link: '/engineer/abonents',
            color: 'bg-indigo-500 hover:bg-indigo-600'
        }
    ];

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.link}
                        className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 hover:shadow-lg`}
                    >
                        <div className="flex items-center space-x-3">
                            {action.icon}
                            <div>
                                <h3 className="font-medium">{action.title}</h3>
                                <p className="text-sm opacity-90">{action.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    );
};

export default QuickActions;
