
import React from 'react';
import Card from './Card';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-emerald-500' : 'text-red-500';

    return (
        <Card>
            <div className="flex items-center">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
            </div>
            {change && (
                <p className={`text-xs mt-2 ${changeColor}`}>
                    {change} с прошлого месяца
                </p>
            )}
        </Card>
    );
};

export default StatCard;
