import React, { useState, useEffect, useMemo, useContext } from 'react';
import { api } from '../../../services/api';
import { Abonent, AbonentHistory, AbonentStatus, BuildingType, WaterTariffType, User, Role, ReceiptDetails, CheckNoticeZoneGroup, PaymentMethod, QRCodePayment } from '../../../types';
import Card from '../../../components/ui/Card';
import Modal, { ConfirmationModal } from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import { EditIcon, FileTextIcon, PrinterIcon, SaveIcon, ReceiptIcon } from '../../../components/ui/Icons';
import { CheckNoticeTemplate } from './CheckNoticeTemplate';
import { AuthContext } from '../../../context/AuthContext';
import PrintProvider from '../../../components/ui/PrintProvider';
import { receiptTemplates, ReceiptTemplateKey } from '../../../components/templates';

const ITEMS_PER_PAGE = 10;
const formatDate = (dateString: string | null | undefined) => dateString ? new Date(dateString).toLocaleDateString('ru-RU') : 'N/A';
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RECEIPT_PRINT_STYLE = `
    @media print {
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        .page-break { page-break-before: always; }
        .receipt-container { width: 148mm; height: 210mm; margin: auto; }
    }
    @page { size: A5; margin: 0; }
    body { margin: 0; background-color: #f0f2f5; }
    .receipt-container {
         width: 148mm;
         height: 210mm;
         margin: 20px auto;
         background-color: white;
         box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
`;

const CHECK_NOTICE_PRINT_STYLE = `
    @media print { body { -webkit-print-color-adjust: exact; } }
    @page { size: A4; margin: 1.5cm; }
`;

// --- MODAL FORMS ---

const AbonentFormModal: React.FC<{ abonent: Abonent | null; onSave: () => void; onClose: () => void; controllers: User[] }> = ({ abonent, onSave, onClose, controllers }) => {
    const [formData, setFormData] = useState({
        fullName: abonent?.fullName || '',
        address: abonent?.address || '',
        phone: abonent?.phone || '',
        numberOfPeople: abonent?.numberOfPeople || 1,
        buildingType: abonent?.buildingType || BuildingType.Apartment,
        waterTariff: abonent?.waterTariff || WaterTariffType.ByPerson,
        status: abonent?.status || AbonentStatus.Active,
        balance: abonent?.balance || 0,
        zoneId: abonent?.zoneId || '',
        hasGarden: abonent?.hasGarden || false,
        gardenSize: abonent?.gardenSize || 0.2,
        controllerId: abonent?.controllerId || '',
        personalAccount: abonent?.personalAccount || '',
        hasWaterService: abonent?.hasWaterService ?? true,
        hasGarbageService: abonent?.hasGarbageService ?? true,
        lastMeterReading: abonent?.lastMeterReading ?? undefined,
        currentMeterReading: abonent?.currentMeterReading ?? undefined,
        meterReadingMonth: abonent?.meterReadingMonth || '',
        isImportedDebt: abonent?.isImportedDebt || false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmingReset, setIsConfirmingReset] = useState(false);
    const [newPassword, setNewPassword] = useState<string|null>(null);
    const [newMeterValue, setNewMeterValue] = useState<string>('');
    const [newMeterDate, setNewMeterDate] = useState<string>('');
    const [isAddingMeter, setIsAddingMeter] = useState(false);

    const handleResetPasswordConfirm = async () => {
        if (!abonent) return;
        setIsConfirmingReset(true);
        try {
            const pass = await api.resetAbonentPassword(abonent.id);
            setNewPassword(pass);
        } catch (error) {
            alert("Ошибка при сбросе пароля.");
        } finally {
            setIsConfirmingReset(false);
            setIsConfirmingReset(false); // Close confirmation
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                lastMeterReading: formData.lastMeterReading === undefined ? undefined : Number(formData.lastMeterReading),
                currentMeterReading: formData.currentMeterReading === undefined ? undefined : Number(formData.currentMeterReading),
            };
            if (abonent) {
                await api.updateAbonent({ ...abonent, ...dataToSave });
            } else {
                const newAbonent = await api.addAbonent({ ...dataToSave, createdAt: new Date().toISOString() });
                if (
                    dataToSave.waterTariff === WaterTariffType.ByMeter &&
                    dataToSave.lastMeterReading !== undefined &&
                    dataToSave.currentMeterReading !== undefined
                ) {
                    const prevMonth = formData.meterReadingMonth
                        ? new Date(formData.meterReadingMonth + '-01')
                        : new Date();
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    await api.addMeterReading({ abonentId: newAbonent.id, value: Number(dataToSave.lastMeterReading), date: prevMonth.toISOString().slice(0, 10) });
                    const currDate = formData.meterReadingMonth
                        ? new Date(formData.meterReadingMonth + '-28')
                        : new Date();
                    await api.addMeterReading({ abonentId: newAbonent.id, value: Number(dataToSave.currentMeterReading), date: currDate.toISOString().slice(0, 10) });
                }
            }
            onSave();
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddMeterReading = async () => {
        if (!abonent || !newMeterValue || !newMeterDate) return;
        setIsAddingMeter(true);
        try {
            await api.addMeterReading({
                abonentId: abonent.id,
                value: Number(newMeterValue),
                date: new Date(newMeterDate + '-28').toISOString().slice(0, 10),
            });
            setNewMeterValue('');
            setNewMeterDate('');
            alert('Показание успешно добавлено!');
        } catch (e) {
            alert('Ошибка при добавлении показания');
        } finally {
            setIsAddingMeter(false);
        }
    };

    const handleAllowPenalty = async () => {
        if (!abonent) return;
        setIsSaving(true);
        try {
            await api.updateAbonent({ ...abonent, ...formData, isImportedDebt: true });
            setFormData({ ...formData, isImportedDebt: true });
            onSave();
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Modal title={abonent ? 'Редактировать абонента' : 'Добавить абонента'} isOpen={true} onClose={onClose} size="lg">
            <ConfirmationModal
                isOpen={isConfirmingReset && !newPassword}
                onClose={() => setIsConfirmingReset(false)}
                onConfirm={handleResetPasswordConfirm}
                title="Сброс пароля"
                message={`Вы уверены, что хотите сбросить пароль для ${abonent?.fullName}? Новый пароль будет показан в окне.`}
                confirmText="Сбросить"
            />
             <Modal isOpen={!!newPassword} onClose={() => setNewPassword(null)} title="Новый пароль">
                <p>Новый пароль для абонента {abonent?.fullName}:</p>
                <p className="text-lg font-bold bg-slate-100 p-2 rounded-md my-2 text-center">{newPassword}</p>
                <p className="text-xs text-slate-500">Сохраните этот пароль. Он больше не будет показан.</p>
            </Modal>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="ФИО" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    <input type="text" placeholder="Адрес" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    <input type="tel" placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    <input type="number" placeholder="Кол-во жильцов" min="1" value={formData.numberOfPeople} onChange={e => setFormData({...formData, numberOfPeople: Number(e.target.value)})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    <select value={formData.buildingType} onChange={e => setFormData({...formData, buildingType: e.target.value as BuildingType})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value={BuildingType.Apartment}>Квартира</option>
                        <option value={BuildingType.Private}>Частный дом</option>
                    </select>
                    <div className="col-span-2 flex gap-4 items-center">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.hasWaterService} onChange={e => setFormData({...formData, hasWaterService: e.target.checked})} />
                            Вода
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.hasGarbageService} onChange={e => setFormData({...formData, hasGarbageService: e.target.checked})} />
                            Мусор
                        </label>
                    </div>
                    {formData.hasWaterService && (
                        <>
                            <select value={formData.waterTariff} onChange={e => setFormData({...formData, waterTariff: e.target.value as WaterTariffType})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value={WaterTariffType.ByPerson}>По количеству людей</option>
                                <option value={WaterTariffType.ByMeter}>По счетчику</option>
                            </select>
                            {formData.waterTariff === WaterTariffType.ByMeter && (
                                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200 mt-2">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium mb-1" htmlFor="last-meter-reading">Предыдущее показание</label>
                                        <input
                                            id="last-meter-reading"
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={10}
                                            placeholder="0000000000"
                                            value={formData.lastMeterReading ?? ''}
                                            onChange={e => setFormData({...formData, lastMeterReading: e.target.value === '' ? undefined : Number(e.target.value)})}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium mb-1" htmlFor="current-meter-reading">Текущее показание</label>
                                        <input
                                            id="current-meter-reading"
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={10}
                                            placeholder="0000000000"
                                            value={formData.currentMeterReading ?? ''}
                                            onChange={e => setFormData({...formData, currentMeterReading: e.target.value === '' ? undefined : Number(e.target.value)})}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col md:col-span-2">
                                        <label className="text-sm font-medium mb-1" htmlFor="meter-reading-month">Месяц показаний</label>
                                        <input
                                            id="meter-reading-month"
                                            type="month"
                                            placeholder="Месяц"
                                            value={formData.meterReadingMonth}
                                            onChange={e => setFormData({...formData, meterReadingMonth: e.target.value})}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                            {formData.waterTariff === WaterTariffType.ByPerson && (
                                <div className="text-sm text-slate-600">Начисление: {formData.numberOfPeople} × тариф (автоматически)</div>
                            )}
                        </>
                    )}
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as AbonentStatus})} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value={AbonentStatus.Active}>Активный</option>
                        <option value={AbonentStatus.Disconnected}>Отключен</option>
                        <option value={AbonentStatus.Archived}>Архивный</option>
                    </select>
                    <div>
                        <label className="block text-sm font-medium">Контролер</label>
                        <select value={formData.controllerId} onChange={e => setFormData({...formData, controllerId: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">Не назначен</option>
                            {controllers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4 col-span-2">
                        <ToggleSwitch enabled={formData.hasGarden} onChange={val => setFormData({...formData, hasGarden: val})} />
                        <label>Есть огород/участок</label>
                    </div>
                    {formData.hasGarden && (
                        <select value={formData.gardenSize} onChange={e => setFormData({...formData, gardenSize: Number(e.target.value)})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value={0.2}>0.2 сотки</option>
                            <option value={0.3}>0.3 сотки</option>
                            <option value={0.5}>0.5 сотки</option>
                            <option value={1}>1 сотка</option>
                        </select>
                    )}
                     <div className="col-span-2">
                        <label className="block text-sm font-medium">Лицевой счет (для банков)</label>
                        <div className="flex gap-2">
                         <input 
                             type="text" 
                             placeholder="Л/С (автоматически)" 
                             value={formData.personalAccount} 
                             onChange={e => setFormData({...formData, personalAccount: e.target.value})} 
                             className="flex-grow block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                         />
                         {abonent && <button type="button" onClick={() => setIsConfirmingReset(true)} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">Сбросить пароль</button>}
                        </div>
                        {!abonent && (
                            <p className="text-xs text-slate-500 mt-1">
                                Лицевой счет будет автоматически сгенерирован в формате YYMM0001 для банков
                            </p>
                        )}
                    </div>
                    {abonent && formData.waterTariff === WaterTariffType.ByMeter && (
                        <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-2">
                            <div className="font-semibold mb-2">Добавить новое показание счётчика</div>
                            <div className="flex flex-col md:flex-row gap-2 items-center">
                                <input
                                    type="number"
                                    placeholder="Новое показание"
                                    value={newMeterValue}
                                    onChange={e => setNewMeterValue(e.target.value)}
                                    className="block w-full md:w-40 px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <input
                                    type="month"
                                    placeholder="Месяц"
                                    value={newMeterDate}
                                    onChange={e => setNewMeterDate(e.target.value)}
                                    className="block w-full md:w-40 px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddMeterReading}
                                    disabled={isAddingMeter || !newMeterValue || !newMeterDate}
                                    className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:bg-emerald-300"
                                >
                                    {isAddingMeter ? 'Добавление...' : 'Добавить показание'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Кнопка Разрешить пеню */}
                {abonent && !formData.isImportedDebt && (
                    <div className="flex justify-end mt-2">
                        <button
                            type="button"
                            onClick={handleAllowPenalty}
                            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:bg-red-300"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Разрешение...' : 'Разрешить пеню (старый долг)'}
                        </button>
                    </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">
                        <SaveIcon className="w-5 h-5"/>
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const AbonentHistoryModal: React.FC<{ abonent: Abonent; onClose: () => void; }> = ({ abonent, onClose }) => {
    const [history, setHistory] = useState<AbonentHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const { user } = useContext(AuthContext)!;
    const isController = user?.role === Role.Controller;

    const [isPrinting, setIsPrinting] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | null>(null);
    const [qrAmount, setQrAmount] = useState<number>(0);
    const [qrCode, setQrCode] = useState<QRCodePayment | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const data = await api.getAbonentHistory(abonent.id);
            setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, [abonent.id]);

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentAmount <= 0) return;
        setIsSavingPayment(true);
        try {
            await api.recordPaymentByController(abonent.id, paymentAmount, PaymentMethod.Cash);
            setPaymentAmount(0);
            const data = await api.getAbonentHistory(abonent.id);
            const latestAbonentData = await api.getAbonents().then(all => all.find(a => a.id === abonent.id));
            if (latestAbonentData) {
                (abonent as any).balance = latestAbonentData.balance;
            }
            setHistory(data);
        } catch(error) {
            console.error("Error recording payment", error);
            alert("Ошибка при сохранении платежа");
        } finally {
            setIsSavingPayment(false);
        }
    }

    const printReceipt = async () => {
        try {
            const details = await api.getReceiptDetails(abonent.id);
            setReceiptDetails(details);
            setIsPrinting(true);
            await api.logReceiptPrint([abonent.id]);
        } catch (error) {
            console.error("Failed to generate receipt", error);
            alert("Ошибка при создании квитанции.");
        }
    };

    const handleCreateQRCode = async () => {
        if (qrAmount <= 0) return;
        try {
            const qrCodeData = await api.createQRCode(abonent.id, qrAmount);
            setQrCode(qrCodeData);
        } catch (error) {
            console.error("Failed to create QR code", error);
            alert("Ошибка при создании QR-кода.");
        }
    };

    return (
        <Modal title={`История: ${abonent.fullName}`} isOpen={true} onClose={onClose} size="lg">
            {isPrinting && receiptDetails && (
                 <PrintProvider onAfterPrint={() => setIsPrinting(false)} title={`Квитанция - ${receiptDetails.abonent.fullName}`} printStyle={RECEIPT_PRINT_STYLE}>
                    {(() => {
                        const key = (receiptDetails.companySettings.receiptTemplate || 'classic') as ReceiptTemplateKey;
                        const Template = receiptTemplates[key];
                        return <Template details={receiptDetails} />;
                    })()}
                </PrintProvider>
            )}
            {loading ? <p>Загрузка истории...</p> : history && (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Общая информация</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong className="font-medium">Адрес:</strong> {abonent.address}</p>
                            <p><strong className="font-medium">Баланс:</strong> <span className={`font-bold ${abonent.balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(abonent.balance)}</span></p>
                        </div>
                    </div>

                    {isController && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-md mb-2">Быстрый платеж (Контролер)</h4>
                           <form onSubmit={handleRecordPayment} className="flex items-center gap-2">
                              <input
                                  type="number"
                                  placeholder="Сумма"
                                  value={paymentAmount || ''}
                                  onChange={e => setPaymentAmount(Number(e.target.value))}
                                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                              <button type="submit" disabled={isSavingPayment || paymentAmount <= 0} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">
                                  {isSavingPayment ? 'Сохранение...' : 'Принять оплату'}
                              </button>
                          </form>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-md mb-2">QR-код для оплаты</h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Сумма для QR-кода"
                                value={qrAmount || ''}
                                onChange={e => setQrAmount(Number(e.target.value))}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <button 
                                onClick={handleCreateQRCode} 
                                disabled={!qrAmount || qrAmount <= 0} 
                                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-green-300"
                            >
                                Создать QR-код
                            </button>
                        </div>
                        {qrCode && (
                            <div className="mt-3 text-center">
                                <img src={qrCode.qrCode} alt="QR Code" className="w-32 h-32 mx-auto border" />
                                <p className="text-sm text-slate-600 mt-2">
                                    QR-код для оплаты {qrCode.amount} сом через {qrCode.bankType === 'mbank' ? 'МБанк' : 'Бакай Банк'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-md mb-2">История платежей</h4>
                            <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                                {history.payments.map(p => (
                                    <li key={p.id} className="flex justify-between p-2 bg-emerald-50 rounded-md">
                                        <span>{formatDate(p.date)}</span>
                                        <span className="font-bold">{formatCurrency(p.amount)}</span>
                                    </li>
                                ))}
                                {history.payments.length === 0 && <p className="text-slate-500">Платежей не найдено.</p>}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-md mb-2">История начислений</h4>
                             <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                                {history.accruals.map(a => (
                                    <li key={a.id} className="flex justify-between p-2 bg-red-50 rounded-md">
                                        <span>{formatDate(a.date)}</span>
                                        <span className="font-bold">- {formatCurrency(a.amount)}</span>
                                    </li>
                                ))}
                                 {history.accruals.length === 0 && <p className="text-slate-500">Начислений не найдено.</p>}
                            </ul>
                        </div>
                    </div>
                     <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={printReceipt} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">
                           <PrinterIcon className="w-5 h-5"/> Печать квитанции
                        </button>
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Закрыть</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const AbonentsTab: React.FC = () => {
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAbonent, setEditingAbonent] = useState<Abonent | null>(null);
    const [historyAbonent, setHistoryAbonent] = useState<Abonent | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ term: '', status: 'all', tariff: 'all', controllerId: 'all' });
    const [selectedAbonents, setSelectedAbonents] = useState<Set<string>>(new Set());
    const [controllers, setControllers] = useState<User[]>([]);
    
    // Printing state
    const [isPrinting, setIsPrinting] = useState(false);
    const [printContent, setPrintContent] = useState<React.ReactNode>(null);
    const [printStyle, setPrintStyle] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    const [checkClosingAbonent, setCheckClosingAbonent] = useState<Abonent | null>(null);
    const [checkClosingData, setCheckClosingData] = useState({
        amount: 0,
        paymentMethod: PaymentMethod.Cash,
        date: new Date().toISOString().split('T')[0],
        comment: '',
    });
    const [isClosing, setIsClosing] = useState(false);
    const { user } = useContext(AuthContext)!;

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    }

    const fetchData = async () => {
        setLoading(true);
        const [abonentsData, usersData] = await Promise.all([
            api.getAbonents(),
            api.getUsers()
        ]);
        setAbonents(abonentsData);
        setControllers(usersData.filter(u => u.role === Role.Controller || u.role === Role.Engineer));
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleSave = async () => {
        await fetchData();
        setIsModalOpen(false);
        setEditingAbonent(null);
    };

    const handleSelectAbonent = (id: string, isSelected: boolean) => {
        const newSelection = new Set(selectedAbonents);
        if (isSelected) {
            newSelection.add(id);
        } else {
            newSelection.delete(id);
        }
        setSelectedAbonents(newSelection);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const currentIds = paginatedAbonents.map(a => a.id);
            setSelectedAbonents(new Set(currentIds));
        } else {
            setSelectedAbonents(new Set());
        }
    };

    const handlePrintSelectedReceipts = async () => {
        if (selectedAbonents.size === 0) {
            showNotification("Выберите абонентов для печати квитанций.");
            return;
        }

        const abonentIds = Array.from(selectedAbonents);
        const allDetails = await api.getBulkReceiptDetails(abonentIds);
        
        const contentToPrint = allDetails.map((details, index) => (
            <React.Fragment key={details.abonent.id}>
                {(() => {
                    const key = (details.companySettings.receiptTemplate || 'classic') as ReceiptTemplateKey;
                    const Template = receiptTemplates[key];
                    return <Template details={details} />;
                })()}
                {index < allDetails.length - 1 && <div className="page-break"></div>}
            </React.Fragment>
        ));

        setPrintContent(<div>{contentToPrint}</div>);
        setPrintStyle(RECEIPT_PRINT_STYLE);
        setIsPrinting(true);

        await api.logReceiptPrint(abonentIds);
    };

    const handlePrintCheckNotice = async () => {
        const idsToPrint = Array.from(selectedAbonents);
        try {
            const noticeData = await api.getCheckNoticeData(idsToPrint);
            if (noticeData.length === 0) {
                showNotification("Нет данных для печати отчета.");
                return;
            }

            setPrintContent(<CheckNoticeTemplate data={noticeData} />);
            setPrintStyle(CHECK_NOTICE_PRINT_STYLE);
            setIsPrinting(true);

            const printedIds = noticeData.flatMap(z => z.abonents).map(a => a.id);
            await api.logCheckNoticePrint(printedIds);
            
        } catch (error) {
            console.error("Failed to generate check notice:", error);
            showNotification("Ошибка при создании чек-извещения.");
        }
    };

    const handleOpenCheckClosing = (abonent: Abonent) => {
        setCheckClosingAbonent(abonent);
        setCheckClosingData({
            amount: Math.abs(abonent.balance),
            paymentMethod: PaymentMethod.Cash,
            date: new Date().toISOString().split('T')[0],
            comment: '',
        });
    };

    const handleCheckClosing = async () => {
        if (!checkClosingAbonent) return;
        setIsClosing(true);
        try {
            await api.createCheckClosing({
                date: checkClosingData.date,
                controllerId: checkClosingAbonent.controllerId || user?.id || '',
                payments: [{
                    paymentId: `manual-${Date.now()}`,
                    abonentId: checkClosingAbonent.id,
                    abonentName: checkClosingAbonent.fullName,
                    amount: checkClosingData.amount,
                    paymentMethod: checkClosingData.paymentMethod,
                    date: checkClosingData.date,
                    isBankPayment: checkClosingData.paymentMethod === PaymentMethod.Bank || checkClosingData.paymentMethod === PaymentMethod.Card || checkClosingData.paymentMethod === PaymentMethod.QR,
                    bankType: undefined,
                    comment: checkClosingData.comment,
                }],
                notes: checkClosingData.comment,
            });
            setCheckClosingAbonent(null);
            showNotification('Чек успешно закрыт!');
            fetchData();
        } catch (e) {
            showNotification('Ошибка при закрытии чека');
        } finally {
            setIsClosing(false);
        }
    };

    const filteredAbonents = useMemo(() => {
        return abonents
            .filter(a => 
                a.fullName.toLowerCase().includes(filters.term.toLowerCase()) || 
                a.address.toLowerCase().includes(filters.term.toLowerCase())
            )
            .filter(a => filters.status === 'all' || a.status === filters.status)
            .filter(a => filters.tariff === 'all' || a.waterTariff === filters.tariff)
            .filter(a => filters.controllerId === 'all' || a.controllerId === filters.controllerId);
    }, [abonents, filters]);

    const paginatedAbonents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAbonents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAbonents, currentPage]);


    if (loading) return <p>Загрузка абонентов...</p>;
    
    return (
        <Card>
            {isPrinting && printContent && (
                <PrintProvider onAfterPrint={() => setIsPrinting(false)} printStyle={printStyle}>
                    {printContent}
                </PrintProvider>
            )}
            {notification && <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">{notification}</div>}
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Управление абонентами</h2>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setEditingAbonent(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">Добавить абонента</button>
                    <button onClick={handlePrintSelectedReceipts} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"><PrinterIcon className="w-5 h-5"/>Квитанции</button>
                    <button onClick={handlePrintCheckNotice} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"><FileTextIcon className="w-5 h-5"/>Чек-извещение</button>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input type="text" placeholder="Поиск по имени/адресу..." value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm md:col-span-1"/>
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="all">Все статусы</option>
                    <option value={AbonentStatus.Active}>Активные</option>
                    <option value={AbonentStatus.Disconnected}>Отключенные</option>
                    <option value={AbonentStatus.Archived}>Архивные</option>
                </select>
                <select value={filters.tariff} onChange={e => setFilters({...filters, tariff: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="all">Все тарифы на воду</option>
                    <option value={WaterTariffType.ByMeter}>По счетчику</option>
                    <option value={WaterTariffType.ByPerson}>По количеству людей</option>
                </select>
                <select value={filters.controllerId} onChange={e => setFilters({...filters, controllerId: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="all">Все контролёры</option>
                    {controllers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selectedAbonents.size > 0 && selectedAbonents.size === paginatedAbonents.length} /></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">ФИО</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Адрес</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Контролер</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Баланс</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Статус</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {paginatedAbonents.map(a => (
                            <tr key={a.id} className="hover:bg-slate-50">
                                <td className="px-4 py-4"><input type="checkbox" checked={selectedAbonents.has(a.id)} onChange={(e) => handleSelectAbonent(a.id, e.target.checked)}/></td>
                                <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-900">{a.fullName}</td>
                                <td className="px-4 py-4 whitespace-nowrap">{a.address}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">{controllers.find(c => c.id === a.controllerId)?.name || '-'}</td>
                                <td className={`px-4 py-4 whitespace-nowrap font-semibold ${a.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(a.balance)}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${a.status === AbonentStatus.Active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{a.status}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => setHistoryAbonent(a)} className="text-slate-500 hover:text-blue-600 p-1">Детали</button>
                                    <button onClick={() => { setEditingAbonent(a); setIsModalOpen(true); }} className="text-slate-500 hover:text-blue-600 p-1"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleOpenCheckClosing(a)} className="text-slate-500 hover:text-green-600 p-1" title="Закрыть чек"><ReceiptIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Pagination currentPage={currentPage} totalItems={filteredAbonents.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            {isModalOpen && <AbonentFormModal abonent={editingAbonent} onSave={handleSave} onClose={() => setIsModalOpen(false)} controllers={controllers} />}
            {historyAbonent && <AbonentHistoryModal abonent={historyAbonent} onClose={() => {setHistoryAbonent(null); fetchData();}} />}
            {checkClosingAbonent && (
                <Modal isOpen={!!checkClosingAbonent} onClose={() => setCheckClosingAbonent(null)} title={`Закрыть чек: ${checkClosingAbonent.fullName}`} size="md">
                    <form onSubmit={e => { e.preventDefault(); handleCheckClosing(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Сумма</label>
                            <input
                                type="number"
                                min={0}
                                value={checkClosingData.amount}
                                onChange={e => setCheckClosingData({ ...checkClosingData, amount: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Способ оплаты</label>
                            <select
                                value={checkClosingData.paymentMethod}
                                onChange={e => setCheckClosingData({ ...checkClosingData, paymentMethod: e.target.value as PaymentMethod })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={PaymentMethod.Cash}>Наличные</option>
                                <option value={PaymentMethod.Bank}>Банк</option>
                                <option value={PaymentMethod.Card}>Карта</option>
                                <option value={PaymentMethod.QR}>QR-код</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Дата оплаты</label>
                            <input
                                type="date"
                                value={checkClosingData.date}
                                onChange={e => setCheckClosingData({ ...checkClosingData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Комментарий</label>
                            <textarea
                                value={checkClosingData.comment}
                                onChange={e => setCheckClosingData({ ...checkClosingData, comment: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows={2}
                                placeholder="Примечание, банк и т.д."
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setCheckClosingAbonent(null)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isClosing || !checkClosingData.amount}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isClosing ? 'Закрытие...' : 'Закрыть чек'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </Card>
    );
};

export default AbonentsTab;