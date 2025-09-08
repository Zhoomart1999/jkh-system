import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api"
import { CompanySettings } from '../../types';
import Card from '../../components/ui/Card';
import { SaveIcon } from '../../components/ui/Icons';

const CompanySettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    const buttonClasses = "bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300";

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const data = await api.getCompanySettings();
                setSettings(data);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        
        setIsSaving(true);
        setSaveMessage(null);
        try {
            await api.updateCompanySettings(settings);
            setSaveMessage("Настройки успешно сохранены!");
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage("Ошибка при сохранении настроек.");
            setTimeout(() => setSaveMessage(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading || !settings) {
        return <p>Загрузка настроек...</p>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800">Настройки предприятия</h1>
            <Card>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Название организации</label>
                        <input type="text" name="name" id="name" value={settings.name} onChange={handleChange} required className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700">Адрес</label>
                        <input type="text" name="address" id="address" value={settings.address} onChange={handleChange} required className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Телефон(ы)</label>
                        <input type="text" name="phone" id="phone" value={settings.phone} onChange={handleChange} required className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-slate-700">Instagram</label>
                        <input type="text" name="instagram" id="instagram" value={settings.instagram} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="receiptTemplate" className="block text-sm font-medium text-slate-700">Шаблон квитанции</label>
                        <select
                            name="receiptTemplate"
                            id="receiptTemplate"
                            value={settings.receiptTemplate || 'classic'}
                            onChange={e => setSettings({ ...settings, receiptTemplate: e.target.value })}
                            className={inputClasses}
                        >
                            <option value="classic">Классический (как на фото)</option>
                            <option value="minimal">Минималистичный</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-4 items-center gap-4">
                         {saveMessage && (
                            <span className="text-sm text-emerald-600">
                                {saveMessage}
                            </span>
                        )}
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className={buttonClasses}
                        >
                            <SaveIcon className="w-5 h-5" />
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CompanySettingsPage;
