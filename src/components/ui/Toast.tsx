'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

/**
 * Toast notification store
 * Manages toast notifications across the application
 */
export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }],
        }));
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    clearAll: () => set({ toasts: [] }),
}));

/**
 * Custom hook for toast notifications
 */
export function useToast() {
    const { addToast } = useToastStore();
    
    return {
        toast: {
            success: (message: string, duration?: number) => addToast(message, 'success', duration),
            error: (message: string, duration?: number) => addToast(message, 'error', duration),
            info: (message: string, duration?: number) => addToast(message, 'info', duration),
            warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
        },
    };
}

/**
 * Individual toast component
 */
function ToastItem({ toast }: { toast: Toast }) {
    const { removeToast } = useToastStore();

    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                removeToast(toast.id);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [toast.id, toast.duration, removeToast]);

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const colors = {
        success: 'bg-green-500/10 border-green-500 text-green-500',
        error: 'bg-red-500/10 border-red-500 text-red-500',
        info: 'bg-blue-500/10 border-blue-500 text-blue-500',
        warning: 'bg-orange-500/10 border-orange-500 text-orange-500',
    };

    const Icon = icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-md shadow-lg min-w-[300px] max-w-md ${colors[toast.type]}`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

/**
 * Toast container component
 * Place this at the root of your app to display toasts
 */
export function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
