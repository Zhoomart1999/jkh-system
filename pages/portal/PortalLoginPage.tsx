
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalAuthContext } from '../../context/PortalAuthContext';
import Card from '../../components/ui/Card';

const PortalLoginPage: React.FC = () => {
    const [personalAccount, setPersonalAccount] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(PortalAuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!personalAccount || !password) {
            setError("Все поля обязательны для заполнения.");
            return;
        }
        
        const abonent = await auth?.login(personalAccount, password);
        if (abonent) {
            navigate('/portal/dashboard', { replace: true });
        } else {
            setError("Неверный лицевой счет или пароль.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">Вход для Абонента</h1>
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-slate-700">Лицевой счет</label>
                            <input 
                                id="account"
                                type="text" 
                                value={personalAccount} 
                                onChange={e => setPersonalAccount(e.target.value)} 
                                required 
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                             <label htmlFor="password"  className="block text-sm font-medium text-slate-700">Пароль</label>
                            <input 
                                id="password"
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Войти</button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default PortalLoginPage;