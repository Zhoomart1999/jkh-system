import React, { useState, useEffect, useRef } from 'react';
// import Modal from '../../../components/ui/Modal';
import { TechnicalRequest, User, InventoryItem, RequestStatus, RequestStatusLabels, RequestTypeLabels, WorkOrderDetails, RequestPriority, RequestPriorityLabels } from '../../../types';
import { api } from "../../../src/firebase/real-api"
import { SaveIcon, CameraIcon, ToolIcon, PrinterIcon } from '../../../components/ui/Icons';
import { PrintProvider } from '../../../components/ui/PrintProvider';
import WorkOrderPrintTemplate from '../../../components/templates/WorkOrderPrintTemplate';
import { useNotifications } from '../../../context/NotificationContext';
import { Modal } from '../../../components/ui/Modal';

// Простой Modal компонент
// Используем общий Modal

interface WorkOrderModalProps {
    request: TechnicalRequest;
    users: User[];
    onClose: () => void;
}

const WORK_ORDER_PRINT_STYLE = `
    @media print { body { -webkit-print-color-adjust: exact; } }
    @page { size: A4; margin: 1.5cm; }
`;

const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ request, users, onClose }) => {
    const { showNotification } = useNotifications();
    const [status, setStatus] = useState<RequestStatus>(request.status);
    const [assignedToId, setAssignedToId] = useState<string>(request.assignedToId || '');
    const [priority, setPriority] = useState<RequestPriority>(request.priority);
    const [notes, setNotes] = useState<string>(request.workOrder?.notes || '');
    const [newAction, setNewAction] = useState<string>('');
    const [hoursSpent, setHoursSpent] = useState<number | undefined>(request.workOrder?.hoursSpent);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [usedMaterials, setUsedMaterials] = useState<WorkOrderDetails['usedMaterials']>(request.workOrder?.usedMaterials || []);
    const [photos, setPhotos] = useState<{before: string, after: string}>(request.workOrder?.photos || {before: '', after: ''});
    
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const beforePhotoRef = useRef<HTMLInputElement>(null);
    const afterPhotoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.getInventory().then(setInventory);
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos(prev => ({...prev, [type]: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddMaterial = () => {
        setUsedMaterials(prev => [...(prev || []), {itemId: '', name: '', unit: '', quantity: 1}]);
    };
    
    const handleMaterialChange = (index: number, field: 'itemId' | 'quantity', value: string | number) => {
        const updated = [...(usedMaterials || [])];
        if(field === 'itemId') {
            const selectedItem = inventory.find(i => i.id === value);
            updated[index] = {...updated[index], itemId: String(value), name: selectedItem?.name || '', unit: selectedItem?.unit || ''};
        } else {
            updated[index] = {...updated[index], quantity: Number(value)};
        }
        setUsedMaterials(updated);
    }
    
    const handleSave = async () => {
        setIsSaving(true);
        const workOrder: WorkOrderDetails = {
            notes,
            hoursSpent: Number(hoursSpent) || 0,
            usedMaterials,
            photos,
            completedAt: status === RequestStatus.Resolved ? new Date().toISOString() : undefined,
        };
        try {
            await api.updateTechnicalRequest(request.id, { status, assignedToId, priority, workOrder, newAction });
            onClose();
        } catch (error) {
            console.error("Failed to save work order", error);
            showNotification('error', 'Ошибка при сохранении наряда');
        } finally {
            setIsSaving(false);
        }
    };
    
    const availableInventory = inventory.filter(i => i.quantity > 0 || usedMaterials?.some(um => um.itemId === i.id));

    return (
        <Modal isOpen={true} onClose={onClose} title={`Наряд: ${RequestTypeLabels[request.type]}`} size="lg">
            {isPrinting && (
                <PrintProvider onAfterPrint={() => setIsPrinting(false)} printStyle={WORK_ORDER_PRINT_STYLE}>
                    <WorkOrderPrintTemplate request={request} />
                </PrintProvider>
            )}
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                    <p><strong>Абонент:</strong> {request.abonentName}</p>
                    <p><strong>Адрес:</strong> {request.abonentAddress}</p>
                    <p><strong>Детали:</strong> {request.details}</p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Статус</label>
                        <select value={status} onChange={e => setStatus(e.target.value as RequestStatus)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md">
                            {Object.values(RequestStatus).map(s => <option key={s} value={s}>{RequestStatusLabels[s]}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Исполнитель</label>
                        <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="">Не назначен</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Приоритет</label>
                        <select value={priority} onChange={e => setPriority(e.target.value as RequestPriority)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md">
                            {Object.values(RequestPriority).map(p => <option key={p} value={p}>{RequestPriorityLabels[p]}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Общие заметки по наряду</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"></textarea>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium">История действий</label>
                    <div className="mt-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-slate-50 text-sm space-y-2">
                        {request.workOrder?.history?.map((h, i) => (
                            <div key={i}>
                                <span className="font-semibold">{new Date(h.date).toLocaleString('ru-RU')} ({h.userName}):</span> {h.action}
                            </div>
                        )).reverse() ?? <p className="text-slate-400">Нет записей в истории.</p>}
                    </div>
                    <textarea value={newAction} onChange={e => setNewAction(e.target.value)} rows={2} className="mt-2 block w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Добавить запись в историю..."></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium">Затрачено часов</label>
                    <input type="number" value={hoursSpent} onChange={e => setHoursSpent(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><ToolIcon className="w-5 h-5" /> Использованные материалы</h4>
                    <div className="space-y-2">
                        {usedMaterials?.map((material, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select value={material.itemId} onChange={(e) => handleMaterialChange(index, 'itemId', e.target.value)} className="flex-grow px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="">Выберите материал</option>
                                    {availableInventory.map(item => <option key={item.id} value={item.id}>{item.name} (в наличии: {item.quantity})</option>)}
                                </select>
                                <input type="number" value={material.quantity} onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)} className="w-24 px-3 py-2 border border-slate-300 rounded-md"/>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddMaterial} className="text-sm text-blue-600 hover:underline mt-2">+ Добавить материал</button>
                </div>

                <div>
                     <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><CameraIcon className="w-5 h-5"/> Фото-фиксация</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <button type="button" onClick={() => beforePhotoRef.current?.click()} className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50">
                                {photos.before ? <img src={photos.before} alt="Before" className="w-full h-full object-cover rounded-lg"/> : <><CameraIcon className="w-8 h-8"/><span>Фото 'ДО'</span></>}
                             </button>
                             <input type="file" accept="image/*" capture="environment" ref={beforePhotoRef} onChange={e => handlePhotoChange(e, 'before')} className="hidden"/>
                        </div>
                         <div>
                             <button type="button" onClick={() => afterPhotoRef.current?.click()} className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50">
                                 {photos.after ? <img src={photos.after} alt="After" className="w-full h-full object-cover rounded-lg"/> : <><CameraIcon className="w-8 h-8"/><span>Фото 'ПОСЛЕ'</span></>}
                             </button>
                             <input type="file" accept="image/*" capture="environment" ref={afterPhotoRef} onChange={e => handlePhotoChange(e, 'after')} className="hidden"/>
                        </div>
                     </div>
                </div>

                <div className="flex justify-between items-center gap-3 pt-4 border-t">
                    <button onClick={() => setIsPrinting(true)} type="button" className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 flex items-center gap-2">
                        <PrinterIcon className="w-5 h-5"/> Печать
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} type="button" className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300">Закрыть</button>
                        <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            <SaveIcon className="w-5 h-5 inline-block mr-2" />
                            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default WorkOrderModal;