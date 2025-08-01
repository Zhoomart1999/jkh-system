import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PortalAuthProvider } from './context/PortalAuthContext';

// Подключаем Firebase инициализацию
import './src/firebase/config';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PortalAuthProvider>
          <App />
        </PortalAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
