import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import Card from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = useCallback(async (pinToVerify: string) => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Используем Firebase для аутентификации
      const success = await auth.login(pinToVerify);
      
      if (!success) {
        setError('Неверный ПИН-код. Попробуйте еще раз.');
        setPin('');
        return;
      }

      // Перенаправляем по роли
      const role = auth.user?.role;
      if (!role) {
        setError('Ошибка определения роли.');
        setPin('');
        return;
      }

      const path = role === Role.Controller ? '/engineer/dashboard' : `/${role}/dashboard`;
      navigate(path, { replace: true });
      
    } catch (e) {
      setError('Ошибка входа. Пожалуйста, проверьте соединение.');
      setPin('');
    } finally {
      setIsAuthenticating(false);
    }
  }, [auth, navigate, isAuthenticating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 8) {
      handleLogin(pin);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 8) {
      handleLogin(pin);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ГИС-КГ</h1>
          <p className="text-gray-600">Система управления ЖКХ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Введите ПИН-код
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="••••••••"
              maxLength={8}
              disabled={isAuthenticating}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 8 || isAuthenticating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage; 