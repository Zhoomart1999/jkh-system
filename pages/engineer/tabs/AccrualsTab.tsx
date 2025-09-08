
import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { api } from "../../../src/firebase/real-api"
import { Accrual } from '../../../types';
import { FileTextIcon } from '../../../components/ui/Icons';

const AccrualsTab: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<Accrual[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateAccruals = async () => {
        if (!window.confirm("Вы уверены, что хотите запустить генерацию ежемесячных начислений для ВСЕХ активных абонентов? Это действие нельзя отменить.")) {
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const newAccruals = await api.generateMonthlyAccruals();
            setResult(newAccruals);
        } catch (e) {
            console.error("Accrual generation failed", e);
            setError("Произошла ошибка при генерации начислений. Пожалуйста, попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex flex-col items-center text-center">
                 <div className="p-4 bg-blue-100 rounded-full mb-4">
                    <FileTextIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Генерация ежемесячных начислений</h2>
                <p className="mt-2 text-slate-600 max-w-md">
                    Нажмите кнопку ниже, чтобы рассчитать и применить ежемесячные начисления за услуги (вода, мусор, полив) для всех активных абонентов в системе на основе текущих тарифов и показаний.
                </p>
                
                <button
                    onClick={handleGenerateAccruals}
                    disabled={isLoading}
                    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300 mt-6 text-base"
                >
                    {isLoading ? 'Генерация...' : 'Сгенерировать начисления'}
                </button>

                {result && (
                     <div className="mt-6 p-4 bg-emerald-100 text-emerald-800 rounded-lg">
                        <p className="font-semibold">Генерация прошла успешно!</p>
                        <p>Создано {result.length} новых начислений для абонентов.</p>
                    </div>
                )}
                 {error && (
                     <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
                        <p className="font-semibold">Ошибка</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AccrualsTab;
