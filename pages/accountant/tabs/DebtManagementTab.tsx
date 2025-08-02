
import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from "../../../services/mock-api"
import { DebtCase, DebtStatus, DebtStatusLabels } from '../../../types';
import { GavelIcon, SaveIcon } from '../../../components/ui/Icons';
import Modal from '../../../components/ui/Modal';

const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU');

interface DebtCaseModalProps {
    debtCase: DebtCase;
    onClose: () => void;
    onUpdate: (updatedCase: DebtCase) => void;
}

const DebtCaseModal: React.FC<DebtCaseModalProps> = ({ debtCase, onClose, onUpdate }) => {
    const [newAction, setNewAction] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdateStatus = async (newStatus: DebtStatus, action: string) => {
        setIsSaving(true);
        try {
            const updatedCase = await api.updateDebtCase(debtCase.id, newStatus, action);
            onUpdate(updatedCase);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newAction.trim()) return;
        setIsSaving(true);
         try {
            const updatedCase = await api.updateDebtCase(debtCase.id, debtCase.status, newAction);
            setNewAction("");
            onUpdate(updatedCase);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal title={`Дело о задолженности: ${debtCase.abonentName}`} isOpen={true} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold">История действий</h4>
                    <ul className="text-sm list-disc list-inside max-h-40 overflow-y-auto mt-1 p-2 bg-slate-50 rounded-md">
                        {debtCase.history.map((h, i) => (
                            <li key={i}>{new Date(h.date).toLocaleDateString()}: {h.action}</li>
                        )).reverse()}
                        {debtCase.history.length === 0 && <p className="text-slate-500">Действий не было.</p>}
                    </ul>
                </div>
                <form onSubmit={handleAddAction}>
                    <h4 className="font-semibold">Добавить действие/заметку</h4>
                    <textarea 
                        value={newAction}
                        onChange={(e) => setNewAction(e.target.value)}
                        placeholder="Например, 'Телефонный звонок, абонент обещал оплатить...'"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                        rows={2}
                    />
                    <button type="submit" disabled={isSaving || !newAction.trim()} className="mt-2 text-sm bg-slate-600 text-white font-semibold py-1 px-3 rounded-lg flex items-center gap-1 disabled:bg-slate-300">
                        <SaveIcon className="w-4 h-4" /> Добавить
                    </button>
                </form>
                <div>
                    <h4 className="font-semibold">Изменить статус дела</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <button disabled={isSaving} onClick={() => handleUpdateStatus(DebtStatus.WarningSent, "Отправлено SMS-предупреждение")} className="text-sm bg-yellow-500 text-white font-semibold py-1 px-3 rounded-lg disabled:opacity-50">Отправить SMS</button>
                        <button disabled={isSaving} onClick={() => handleUpdateStatus(DebtStatus.PreLegal, "Направлена досудебная претензия")} className="text-sm bg-orange-500 text-white font-semibold py-1 px-3 rounded-lg disabled:opacity-50">Досудебная претензия</button>
                        <button disabled={isSaving} onClick={() => handleUpdateStatus(DebtStatus.LegalAction, "Дело передано в суд")} className="text-sm bg-red-500 text-white font-semibold py-1 px-3 rounded-lg disabled:opacity-50">Передать в суд</button>
                        <button disabled={isSaving} onClick={() => handleUpdateStatus(DebtStatus.Closed, "Дело закрыто (долг погашен)")} className="text-sm bg-emerald-500 text-white font-semibold py-1 px-3 rounded-lg disabled:opacity-50">Закрыть дело</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const DebtManagementTab: React.FC = () => {
    const [debtCases, setDebtCases] = useState<DebtCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState<DebtCase | null>(null);

    const fetchData = () => {
        setLoading(true);
        api.getDebtCases().then(data => {
            setDebtCases(data.sort((a,b) => b.currentDebt - a.currentDebt));
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateCase = (updatedCase: DebtCase) => {
        fetchData();
        setSelectedCase(updatedCase);
    };
    
    const StatusBadge: React.FC<{ status: DebtStatus }> = ({ status }) => {
        const statusMap = {
            [DebtStatus.Monitoring]: 'bg-slate-100 text-slate-800',
            [DebtStatus.WarningSent]: 'bg-yellow-100 text-yellow-800',
            [DebtStatus.PreLegal]: 'bg-orange-100 text-orange-800',
            [DebtStatus.LegalAction]: 'bg-red-100 text-red-800',
            [DebtStatus.Closed]: 'bg-emerald-100 text-emerald-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{DebtStatusLabels[status]}</span>;
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">Управление задолженностями</h2>
            {loading ? <p>Загрузка...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Абонент</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Сумма долга</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Срок долга (дней)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Статус дела</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {debtCases.map(dcase => (
                                <tr key={dcase.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedCase(dcase)}>
                                    <td className="px-4 py-4 font-medium">{dcase.abonentName}</td>
                                    <td className="px-4 py-4 font-semibold text-red-600">{formatCurrency(dcase.currentDebt)} сом</td>
                                    <td className="px-4 py-4">{dcase.debtAgeDays}</td>
                                    <td className="px-4 py-4"><StatusBadge status={dcase.status}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedCase && (
                <DebtCaseModal 
                    debtCase={selectedCase}
                    onClose={() => setSelectedCase(null)}
                    onUpdate={handleUpdateCase}
                />
            )}
        </Card>
    )
};

export default DebtManagementTab;