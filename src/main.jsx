import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <App />
          <Toaster position="bottom-center" toastOptions={{ style: { background: '#1a1c22', color: '#fff', border: '1px solid rgba(212,175,55,.3)', fontFamily: 'Outfit, sans-serif', borderRadius: 6 }, iconTheme: { primary: '#d4af37', secondary: '#1a1c22' } }} />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
