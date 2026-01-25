import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Toast, ToastType } from '../components/common/Toast';
import { eventEmitter, EVENTS } from '../utils/events/EventEmitter';

interface ToastContextProps {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, id: Date.now() });
    };

    useEffect(() => {
        // Listen for global API error events
        const unsubscribeApi = eventEmitter.on(EVENTS.API_ERROR, (message: string) => {
            showToast(message, 'error');
        });

        // Listen for explicit toast requests (e.g. from non-React code if needed)
        const unsubscribeToast = eventEmitter.on(EVENTS.SHOW_TOAST, (data: any) => {
            showToast(data.message, data.type);
        });

        return () => {
            unsubscribeApi();
            unsubscribeToast();
        };
    }, []);

    const hideToast = () => {
        setToast(null);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onHide={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};
