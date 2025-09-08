import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { Abonent } from '../../types';
import Card from '../../components/ui/Card';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, ClockIcon, MegaphoneIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationTemplate {
    id: string;
    type: NotificationType;
    title: string;
    template: string;
    variables: string[];
    isActive: boolean;
}

interface NotificationCampaign {
    id: string;
    name: string;
    type: NotificationType;
    targetCount: number;
    sentCount: number;
    status: 'draft' | 'sending' | 'completed' | 'failed';
    createdAt: string;
    completedAt?: string;
}

const NotificationsPage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showCreateCampaign, setShowCreateCampaign] = useState(false);

    // Форма создания кампании
    const [campaignData, setCampaignData] = useState({
        name: '',
        type: NotificationType.DebtWarning as NotificationType,
        minDebt: 1000,
        maxDebt: 10000,
        templateId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [abonentsData, notificationsData, templatesData, campaignsData] = await Promise.all([
                api.getAbonents(),
                api.getNotifications(),
                api.getNotificationTemplates(),
                api.getNotificationCampaigns()
            ]);
            setAbonents(abonentsData);
            setNotifications(notificationsData as any);
            setTemplates(templatesData as any);
            setCampaigns(campaignsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNotificationCampaign = async () => {
        if (!campaignData.name || !campaignData.templateId) return;

        setSending(true);
        try {
            const targetAbonents = abonents.filter(a => 
                a.balance >= campaignData.minDebt && a.balance <= campaignData.maxDebt
            );

            const newCampaign: NotificationCampaign = {
                id: Date.now().toString(),
                name: campaignData.name,
                type: campaignData.type,
                targetCount: targetAbonents.length,
                sentCount: 0,
                status: 'sending',
                createdAt: new Date().toISOString()
            };

            setCampaigns([newCampaign, ...campaigns]);

            // Имитация отправки уведомлений
            for (let i = 0; i < targetAbonents.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setCampaigns(prev => prev.map(c => 
                    c.id === newCampaign.id 
                        ? { ...c, sentCount: i + 1 }
                        : c
                ));
            }

            // Завершение кампании
            setCampaigns(prev => prev.map(c => 
                c.id === newCampaign.id 
                    ? { ...c, status: 'completed', completedAt: new Date().toISOString() }
                    : c
            ));

            setShowCreateCampaign(false);
            setCampaignData({
                name: '',
                type: NotificationType.DebtWarning,
                minDebt: 1000,
                maxDebt: 10000,
                templateId: ''
            });

            showNotification({
                type: 'success',
                title: 'Кампания завершена',
                message: `Кампания завершена! Отправлено ${targetAbonents.length} уведомлений`
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка создания',
                message: 'Ошибка при создании кампании'
            });
        } finally {
            setSending(false);
        }
    };

    const sendTestNotification = async (abonentId: string) => {
        try {
            // Имитация отправки тестового уведомления
            await new Promise(resolve => setTimeout(resolve, 1000));
            showNotification({
                type: 'success',
                title: 'Тест отправлен',
                message: 'Тестовое уведомление отправлено!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка отправки',
                message: 'Ошибка при отправке тестового уведомления'
            });
        }
    };

    const getNotificationTypeLabel = (type: NotificationType) => {
        switch (type) {
            case NotificationType.PaymentReceived: return 'Платеж получен';
            case NotificationType.PaymentFailed: return 'Платеж не прошел';
            case NotificationType.DebtWarning: return 'Предупреждение о долге';
            case NotificationType.ServiceDisconnection: return 'Отключение услуги';
            case NotificationType.ServiceRestoration: return 'Восстановление услуги';
            case NotificationType.NewTariff: return 'Новый тариф';
            case NotificationType.MaintenanceScheduled: return 'Плановые работы';
            default: return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Черновик';
            case 'sending': return 'Отправка';
            case 'completed': return 'Завершена';
            case 'failed': return 'Ошибка';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'sending': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getDebtors = () => abonents.filter(a => a.balance > 1000);
    const getActiveCampaigns = () => campaigns.filter(c => c.status === 'sending');
    const getCompletedCampaigns = () => campaigns.filter(c => c.status === 'completed');

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Уведомления</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Уведомления</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getDebtors().length}
                                </div>
                                <div className="text-sm text-slate-600">Должники для уведомлений</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <BellIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {notifications.length}
                                </div>
                                <div className="text-sm text-slate-600">Всего уведомлений</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getActiveCampaigns().length}
                                </div>
                                <div className="text-sm text-slate-600">Активные кампании</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckIcon className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {getCompletedCampaigns().length}
                                </div>
                                <div className="text-sm text-slate-600">Завершенные кампании</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Создание кампании */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <BellIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Создать кампанию уведомлений</h3>
                    </div>
                    <button
                        onClick={() => setShowCreateCampaign(!showCreateCampaign)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showCreateCampaign ? 'Отмена' : 'Новая кампания'}
                    </button>
                </div>

                {showCreateCampaign && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Название кампании
                                </label>
                                <input
                                    type="text"
                                    value={campaignData.name}
                                    onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                                    placeholder="Например: Предупреждение о долге"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Тип уведомления
                                </label>
                                <select
                                    value={campaignData.type}
                                    onChange={(e) => setCampaignData({...campaignData, type: e.target.value as NotificationType})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={NotificationType.DebtWarning}>Предупреждение о долге</option>
                                    <option value={NotificationType.ServiceDisconnection}>Отключение услуги</option>
                                    <option value={NotificationType.NewTariff}>Новый тариф</option>
                                    <option value={NotificationType.MaintenanceScheduled}>Плановые работы</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Минимальный долг (сом)
                                </label>
                                <input
                                    type="number"
                                    value={campaignData.minDebt}
                                    onChange={(e) => setCampaignData({...campaignData, minDebt: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Максимальный долг (сом)
                                </label>
                                <input
                                    type="number"
                                    value={campaignData.maxDebt}
                                    onChange={(e) => setCampaignData({...campaignData, maxDebt: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Шаблон уведомления
                                </label>
                                <select
                                    value={campaignData.templateId}
                                    onChange={(e) => setCampaignData({...campaignData, templateId: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите шаблон...</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Целевая аудитория:</h4>
                            <div className="text-sm text-blue-700">
                                <p>Абоненты с долгом от {campaignData.minDebt.toLocaleString('ru-RU')} до {campaignData.maxDebt.toLocaleString('ru-RU')} сом</p>
                                <p>Всего: {abonents.filter(a => a.balance >= campaignData.minDebt && a.balance <= campaignData.maxDebt).length} абонентов</p>
                            </div>
                        </div>

                        <button
                            onClick={createNotificationCampaign}
                            disabled={sending || !campaignData.name || !campaignData.templateId}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {sending ? 'Отправка...' : 'Запустить кампанию'}
                        </button>
                    </div>
                )}
            </Card>

            {/* Активные кампании */}
            {getActiveCampaigns().length > 0 && (
                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Активные кампании</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {getActiveCampaigns().map((campaign) => (
                            <div key={campaign.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-blue-900">{campaign.name}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                        {getStatusLabel(campaign.status)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                                    <div>
                                        <span>Тип:</span>
                                        <span className="font-medium ml-2">{getNotificationTypeLabel(campaign.type)}</span>
                                    </div>
                                    <div>
                                        <span>Прогресс:</span>
                                        <span className="font-medium ml-2">{campaign.sentCount} / {campaign.targetCount}</span>
                                    </div>
                                    <div>
                                        <span>Создана:</span>
                                        <span className="font-medium ml-2">{new Date(campaign.createdAt).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${(campaign.sentCount / campaign.targetCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Завершенные кампании */}
            {getCompletedCampaigns().length > 0 && (
                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <CheckIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Завершенные кампании</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Название
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Тип
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Отправлено
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Дата завершения
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {getCompletedCampaigns().map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {campaign.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {getNotificationTypeLabel(campaign.type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {campaign.sentCount} / {campaign.targetCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                                {getStatusLabel(campaign.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {campaign.completedAt ? new Date(campaign.completedAt).toLocaleDateString('ru-RU') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Список должников */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Должники для уведомлений</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Абонент
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Адрес
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Долг
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Телефон
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {getDebtors().slice(0, 10).map((abonent) => (
                                <tr key={abonent.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {abonent.fullName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {abonent.address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                        {abonent.balance.toLocaleString('ru-RU')} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {abonent.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => sendTestNotification(abonent.id)}
                                            className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                        >
                                            Тест SMS
                                        </button>
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

export default NotificationsPage; 