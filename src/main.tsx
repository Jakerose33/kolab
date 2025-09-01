import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { SecurityProvider } from '@/components/SecurityProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const container = document.getElementById("root");
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <SecurityProvider>
            <AuthProvider>
              <App />
              <Toaster />
            </AuthProvider>
          </SecurityProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);