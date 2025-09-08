
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем сохраненного пользователя при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Простая функция входа с прямыми PIN-кодами
  const login = async (pin: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 Попытка входа с PIN:', pin);
      
      // Прямые PIN-коды как было раньше
      const users: { [key: string]: User } = {
        '22222222': {
          id: '1',
          name: 'Инженер',
          role: Role.Engineer,
          pin: '22222222',
          isActive: true
        },
        '11111111': {
          id: '2',
          name: 'Администратор',
          role: Role.Admin,
          pin: '11111111',
          isActive: true
        },
        '33333333': {
          id: '3',
          name: 'Бухгалтер',
          role: Role.Accountant,
          pin: '33333333',
          isActive: true
        }
      };
      
      console.log('📋 Доступные пользователи:', Object.keys(users));
      
      const userData = users[pin];
      console.log('👤 Найденный пользователь:', userData);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Вход успешен для:', userData.name);
        return true;
      }
      
      console.log('❌ Пользователь не найден для PIN:', pin);
      return false;
    } catch (error) {
      console.error('💥 Ошибка при входе:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
