import React, { useState, useEffect } from 'react';
import { CogIcon, TrashIcon, PlusIcon, PlayIcon, PauseIcon, KeyIcon, GlobeIcon, BellIcon } from './Icons';
import { bankIntegration, BankIntegrationConfig, SMSService, EmailService } from '../../utils/bankIntegration';
import { notificationService, NotificationConfig } from '../../utils/notificationService';
import { externalAPI, APIKey, WebhookEndpoint } from '../../utils/externalAPI';

interface IntegrationsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'notifications' | 'api' | 'webhooks'>('bank');
  const [bankConfigs, setBankConfigs] = useState<BankIntegrationConfig[]>([]);
  const [smsServices, setSmsServices] = useState<SMSService[]>([]);
  const [emailServices, setEmailServices] = useState<EmailService[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'bank' | 'sms' | 'email' | 'api' | 'webhook'>('bank');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setBankConfigs(bankIntegration.getBankConfigs());
    setSmsServices(notificationService.getSMSServices());
    setEmailServices(notificationService.getEmailServices());
    setApiKeys(externalAPI.getAPIKeys());
    setWebhooks(externalAPI.getWebhooks());
  };

  const handleCreateItem = (data: any) => {
    switch (modalType) {
      case 'bank':
        bankIntegration.addBankConfig(data);
        break;
      case 'sms':
        notificationService.addSMSService(data);
        break;
      case 'email':
        notificationService.addEmailService(data);
        break;
      case 'api':
        externalAPI.createAPIKey(data.name, data.permissions, {
          rateLimit: data.rateLimit,
          expiresAt: data.expiresAt
        });
        break;
      case 'webhook':
        externalAPI.createWebhook(data.name, data.url, data.events, data.secret);
        break;
    }
    
    loadData();
    setShowCreateModal(false);
    setEditingItem(null);
  };

  const handleUpdateItem = (id: string, updates: any) => {
    // Обновление различных типов элементов
    loadData();
    setEditingItem(null);
  };

  const handleDeleteItem = (type: string, id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      switch (type) {
        case 'bank':
          bankIntegration.removeBankConfig(id);
          break;
        case 'sms':
          notificationService.removeSMSService(id);
          break;
        case 'email':
          notificationService.removeEmailService(id);
          break;
        case 'api':
          externalAPI.deleteAPIKey(id);
          break;
        case 'webhook':
          externalAPI.deleteWebhook(id);
          break;
      }
      loadData();
    }
  };

  const handleTestConnection = async (bankName: string) => {
    try {
      const result = await bankIntegration.testBankConnection(bankName);
      if (result.success) {
        notificationService.showNotification({
            type: 'success',
            title: 'Подключение успешно',
            message: 'Подключение успешно!'
        });
      } else {
        notificationService.showNotification({
            type: 'error',
            title: 'Ошибка подключения',
            message: `Ошибка подключения: ${result.error}`
        });
      }
    } catch (error) {
      notificationService.showNotification({
          type: 'error',
          title: 'Ошибка тестирования',
          message: `Ошибка тестирования: ${error}`
      });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Активен' : 'Неактивен';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CogIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Управление интеграциями</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('bank')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bank'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Банковские API ({bankConfigs.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Уведомления ({smsServices.length + emailServices.length})
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API ключи ({apiKeys.length})
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'webhooks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Webhooks ({webhooks.length})
            </button>
          </nav>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Банковские интеграции</h3>
                <button
                  onClick={() => {
                    setModalType('bank');
                    setShowCreateModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Добавить банк</span>
                </button>
              </div>

              {bankConfigs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет настроенных банковских интеграций
                </div>
              ) : (
                <div className="grid gap-4">
                  {bankConfigs.map(config => (
                    <div key={config.bankName} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <GlobeIcon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold">{config.bankName}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(config.sandbox)}`}>
                              {config.sandbox ? 'Тестовый режим' : 'Продакшн'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>API URL: {config.apiUrl}</div>
                            <div>Поддерживаемые операции: {config.supportedOperations.join(', ')}</div>
                            <div>Лимиты: {config.rateLimits.requestsPerMinute}/мин, {config.rateLimits.requestsPerHour}/час</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTestConnection(config.bankName)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Тест подключения"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('bank', config.bankName)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            title="Удалить"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* SMS сервисы */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">SMS сервисы</h3>
                  <button
                    onClick={() => {
                      setModalType('sms');
                      setShowCreateModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить SMS сервис</span>
                  </button>
                </div>

                {smsServices.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Нет настроенных SMS сервисов
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {smsServices.map(service => (
                      <div key={service.name} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <BellIcon className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold">{service.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(service.isActive)}`}>
                                {getStatusText(service.isActive)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>API URL: {service.apiUrl}</div>
                              <div>Отправитель: {service.sender}</div>
                              <div>Лимит: {service.rateLimit} SMS/мин</div>
                              <div>Баланс: {service.balance} SMS</div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteItem('sms', service.name)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                              title="Удалить"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Email сервисы */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Email сервисы</h3>
                  <button
                    onClick={() => {
                      setModalType('email');
                      setShowCreateModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить Email сервис</span>
                  </button>
                </div>

                {emailServices.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Нет настроенных Email сервисов
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {emailServices.map(service => (
                      <div key={service.name} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <BellIcon className="w-5 h-5 text-purple-600" />
                              <h4 className="font-semibold">{service.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(service.isActive)}`}>
                                {getStatusText(service.isActive)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Тип: {service.type}</div>
                              {service.type === 'smtp' && (
                                <>
                                  <div>Хост: {service.host}:{service.port}</div>
                                  <div>Пользователь: {service.username}</div>
                                </>
                              )}
                              <div>От: {service.fromName} &lt;{service.fromEmail}&gt;</div>
                              <div>Лимит: {service.rateLimit} Email/мин</div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteItem('email', service.name)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                              title="Удалить"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">API ключи</h3>
                <button
                  onClick={() => {
                    setModalType('api');
                    setShowCreateModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Создать API ключ</span>
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет созданных API ключей
                </div>
              ) : (
                <div className="grid gap-4">
                  {apiKeys.map(key => (
                    <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <KeyIcon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold">{key.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(key.isActive)}`}>
                              {getStatusText(key.isActive)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Ключ: {key.key.substring(0, 8)}...</div>
                            <div>Разрешения: {key.permissions.join(', ')}</div>
                            <div>Лимит: {key.rateLimit} запросов/мин</div>
                            {key.expiresAt && (
                              <div>Истекает: {new Date(key.expiresAt).toLocaleDateString('ru-RU')}</div>
                            )}
                            {key.lastUsed && (
                              <div>Последнее использование: {new Date(key.lastUsed).toLocaleString('ru-RU')}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => externalAPI.deactivateAPIKey(key.id)}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
                            title={key.isActive ? 'Деактивировать' : 'Активировать'}
                          >
                            {key.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteItem('api', key.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            title="Удалить"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Webhook эндпоинты</h3>
                <button
                  onClick={() => {
                    setModalType('webhook');
                    setShowCreateModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Добавить webhook</span>
                </button>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет настроенных webhook'ов
                </div>
              ) : (
                <div className="grid gap-4">
                  {webhooks.map(webhook => (
                    <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <GlobeIcon className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold">{webhook.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(webhook.isActive)}`}>
                              {getStatusText(webhook.isActive)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>URL: {webhook.url}</div>
                            <div>События: {webhook.events.join(', ')}</div>
                            <div>Повторы: {webhook.retryCount}/3</div>
                            {webhook.lastTriggered && (
                              <div>Последний вызов: {new Date(webhook.lastTriggered).toLocaleString('ru-RU')}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteItem('webhook', webhook.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            title="Удалить"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания/редактирования */}
      {showCreateModal && (
        <CreateItemModal
          type={modalType}
          onSubmit={handleCreateItem}
          onClose={() => {
            setShowCreateModal(false);
            setEditingItem(null);
          }}
          item={editingItem}
        />
      )}
    </div>
  );
};

// Модальное окно создания элемента
interface CreateItemModalProps {
  type: 'bank' | 'sms' | 'email' | 'api' | 'webhook';
  onSubmit: (data: any) => void;
  onClose: () => void;
  item?: any;
}

const CreateItemModal: React.FC<CreateItemModalProps> = ({ type, onSubmit, onClose, item }) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Устанавливаем значения по умолчанию
      switch (type) {
        case 'bank':
          setFormData({
            bankName: '',
            apiUrl: '',
            apiKey: '',
            secretKey: '',
            sandbox: true,
            supportedOperations: ['balance', 'transfer', 'debit'],
            rateLimits: { requestsPerMinute: 100, requestsPerHour: 1000 }
          });
          break;
        case 'sms':
          setFormData({
            name: '',
            apiUrl: '',
            apiKey: '',
            sender: '',
            rateLimit: 100
          });
          break;
        case 'email':
          setFormData({
            name: '',
            type: 'smtp',
            host: '',
            port: 587,
            username: '',
            password: '',
            fromEmail: '',
            fromName: '',
            rateLimit: 100
          });
          break;
        case 'api':
          setFormData({
            name: '',
            permissions: ['read:abonents', 'read:payments'],
            rateLimit: 100
          });
          break;
        case 'webhook':
          setFormData({
            name: '',
            url: '',
            events: ['abonent.created', 'payment.created'],
            secret: ''
          });
          break;
      }
    }
  }, [type, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderForm = () => {
    switch (type) {
      case 'bank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название банка *</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API URL *</label>
              <input
                type="url"
                value={formData.apiUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API ключ *</label>
                <input
                  type="text"
                  value={formData.apiKey || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Секретный ключ</label>
                <input
                  type="password"
                  value={formData.secretKey || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sandbox || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, sandbox: e.target.checked }))}
                  className="mr-2"
                />
                Тестовый режим (sandbox)
              </label>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название сервиса *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API URL *</label>
              <input
                type="url"
                value={formData.apiUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API ключ *</label>
                <input
                  type="text"
                  value={formData.apiKey || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Отправитель *</label>
                <input
                  type="text"
                  value={formData.sender || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название сервиса *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип *</label>
              <select
                value={formData.type || 'smtp'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="smtp">SMTP</option>
                <option value="api">API</option>
              </select>
            </div>
            
            {formData.type === 'smtp' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP хост *</label>
                  <input
                    type="text"
                    value={formData.host || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Порт *</label>
                  <input
                    type="number"
                    value={formData.port || 587}
                    onChange={(e) => setFormData(prev => ({ ...prev, port: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пользователь *</label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пароль *</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email отправителя *</label>
                <input
                  type="email"
                  value={formData.fromEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имя отправителя *</label>
                <input
                  type="text"
                  value={formData.fromName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название ключа *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Разрешения *</label>
              <div className="space-y-2">
                {['read:abonents', 'write:abonents', 'read:payments', 'write:payments', 'read:tariffs', 'write:tariffs', 'read:statistics', 'write:notifications'].map(permission => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.includes(permission) || false}
                      onChange={(e) => {
                        const permissions = formData.permissions || [];
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, permissions: [...permissions, permission] }));
                        } else {
                          setFormData(prev => ({ ...prev, permissions: permissions.filter(p => p !== permission) }));
                        }
                      }}
                      className="mr-2"
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Лимит запросов (в минуту)</label>
              <input
                type="number"
                value={formData.rateLimit || 100}
                onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="1000"
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название webhook *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">События *</label>
              <div className="space-y-2">
                {['abonent.created', 'abonent.updated', 'abonent.deleted', 'payment.created', 'payment.updated', 'tariffs.updated'].map(event => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.events?.includes(event) || false}
                      onChange={(e) => {
                        const events = formData.events || [];
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, events: [...events, event] }));
                        } else {
                          setFormData(prev => ({ ...prev, events: events.filter(ev => ev !== event) }));
                        }
                      }}
                      className="mr-2"
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Секретный ключ *</label>
              <input
                type="text"
                value={formData.secret || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'bank': return item ? 'Редактирование банка' : 'Добавление банка';
      case 'sms': return item ? 'Редактирование SMS сервиса' : 'Добавление SMS сервиса';
      case 'email': return item ? 'Редактирование Email сервиса' : 'Добавление Email сервиса';
      case 'api': return item ? 'Редактирование API ключа' : 'Создание API ключа';
      case 'webhook': return item ? 'Редактирование webhook' : 'Добавление webhook';
      default: return 'Создание элемента';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {renderForm()}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {item ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntegrationsManager; 