import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeftIcon } from '../components/ui/Icons';
import { Role } from '../types';

const ZHKHLogo: React.FC = () => (
    <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-7xl font-extrabold text-white tracking-tighter">ЖКХ</span>
    </div>
);

interface PinPadProps {
    pin: string;
    onPinChange: (newPin: string) => void;
    error: string | null;
    isAuthenticating: boolean;
}

const PinPad: React.FC<PinPadProps> = ({ pin, onPinChange, error, isAuthenticating }) => {
    const handleKeyPress = (key: string) => {
        if (pin.length >= 8) {
            onPinChange(key);
        } else {
            onPinChange(pin + key);
        }
    };

    const handleDelete = () => {
        onPinChange(pin.slice(0, -1));
    };

    const handleClear = () => {
        onPinChange('');
    };

    const pinDisplay = '●'.repeat(pin.length).padEnd(8, '○');
    const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return (
        <div className="w-full max-w-xs flex flex-col items-center">
            <h2 className="text-lg font-medium text-slate-600">Введите ПИН-код для входа</h2>
            <div className="my-6 text-2xl font-mono tracking-widest space-x-1">
                {pinDisplay.split('').map((char, index) => (
                    <span key={index} className={char === '●' ? 'text-blue-500' : 'text-slate-300'}>
                        {char}
                    </span>
                ))}
            </div>
             <div className="text-red-500 text-sm mb-4 h-5">
                {isAuthenticating ? 'Проверка...' : error}
             </div>
            
            <div className="grid grid-cols-3 gap-4 w-full">
                {buttons.map(btn => (
                    <button 
                        key={btn} 
                        onClick={() => handleKeyPress(btn)} 
                        disabled={isAuthenticating}
                        className="text-3xl font-light h-20 rounded-lg bg-slate-200/50 hover:bg-slate-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                    >
                        {btn}
                    </button>
                ))}
                 <button onClick={handleClear} disabled={isAuthenticating} className="text-3xl font-light h-20 rounded-lg bg-slate-200/50 hover:bg-slate-200/80 transition-colors flex items-center justify-center disabled:opacity-50">
                    ✕
                </button>
                <button onClick={() => handleKeyPress('0')} disabled={isAuthenticating} className="text-3xl font-light h-20 rounded-lg bg-slate-200/50 hover:bg-slate-200/80 transition-colors disabled:opacity-50">
                    0
                </button>
                <button onClick={handleDelete} disabled={isAuthenticating} className="text-3xl font-light h-20 rounded-lg bg-slate-200/50 hover:bg-slate-200/80 transition-colors flex items-center justify-center disabled:opacity-50">
                   <ArrowLeftIcon className="w-8 h-8 text-slate-600" />
                </button>
            </div>
        </div>
    );
};

const LoginPage: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = useCallback(async (pinToVerify: string) => {
        if (isAuthenticating) return;
        
        setIsAuthenticating(true);
        setError(null);
        
        try {
            const user = await auth?.login(pinToVerify);
            if (user) {
                const path = user.role === Role.Controller ? '/engineer/dashboard' : `/${user.role}/dashboard`;
                navigate(path, { replace: true });
            } else {
                setError('Неверный ПИН-код. Попробуйте еще раз.');
                setPin('');
            }
        } catch (e) {
            setError('Ошибка входа. Пожалуйста, проверьте соединение.');
            setPin('');
        } finally {
            setIsAuthenticating(false);
        }
    }, [auth, navigate, isAuthenticating]);
    
    useEffect(() => {
        if (pin.length === 8) {
            handleLogin(pin);
        }
    }, [pin, handleLogin]);

    const handlePinChange = (newPin: string) => {
        if (error) {
            setError(null);
        }
        setPin(newPin);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
            <div className="w-full max-w-4xl flex bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-white/50">
                <div className="w-1/2 bg-slate-50/50 hidden md:flex flex-col items-center justify-center p-12 text-center">
                    <ZHKHLogo />
                    <h1 className="text-4xl font-bold text-slate-800 mt-4">ГИС ЖКХ</h1>
                    <p className="text-slate-500 mt-2">Система Управления Коммунальными Услугами Кыргызстана</p>
                    <div className="mt-8 text-xs text-slate-400">
                        <p>Версия: 9.1.80280</p>
                        <p>Дата окончания лицензии: 04.07.2025</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12">
                    <PinPad 
                        pin={pin} 
                        onPinChange={handlePinChange}
                        error={error} 
                        isAuthenticating={isAuthenticating}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
