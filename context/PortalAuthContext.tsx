
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Abonent } from '../types';
import { api } from '../services/api';

interface PortalAuthContextType {
  abonent: Abonent | null;
  loading: boolean;
  login: (personalAccount: string, password: string) => Promise<Abonent | null>;
  logout: () => void;
}

export const PortalAuthContext = createContext<PortalAuthContextType | null>(null);

export const PortalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [abonent, setAbonent] = useState<Abonent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAbonent = localStorage.getItem('gis-abonent');
    if (storedAbonent) {
      setAbonent(JSON.parse(storedAbonent));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (personalAccount: string, password: string) => {
    setLoading(true);
    try {
      const loggedInAbonent = await api.abonentLogin(personalAccount, password);
      if (loggedInAbonent) {
        setAbonent(loggedInAbonent);
        localStorage.setItem('gis-abonent', JSON.stringify(loggedInAbonent));
        return loggedInAbonent;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAbonent(null);
    localStorage.removeItem('gis-abonent');
  }, []);

  const value = { abonent, loading, login, logout };

  return (
    <PortalAuthContext.Provider value={value}>
      {!loading && children}
    </PortalAuthContext.Provider>
  );
};