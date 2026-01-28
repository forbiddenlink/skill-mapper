'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useState } from 'react';
import { useKeyboardShortcut, formatShortcut, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';

const SHORTCUTS: KeyboardShortcut[] = [
    {
        key: 'Escape',
        description: 'Close modals and panels',
        action: () => {},
    },
    {
        key: 'ArrowUp',
        description: 'Navigate to skill above',
        action: () => {},
    },
    {
        key: 'ArrowDown',
        description: 'Navigate to skill below',
        action: () => {},
    },
    {
        key: 'ArrowLeft',
        description: 'Navigate to skill on the left',
        action: () => {},
    },
    {
        key: 'ArrowRight',
        description: 'Navigate to skill on the right',
        action: () => {},
    },
    {
        key: 's',
        ctrlKey: true,
        description: 'Export progress (save)',
        action: () => {},
    },
    {
        key: '?',
        shiftKey: true,
        description: 'Show this help menu',
        action: () => {},
    },
];

export default function KeyboardShortcutsModal() {
    const [isOpen, setIsOpen] = useState(false);

    // Listen for ? key to open modal
    useKeyboardShortcut(
        '?',
        () => setIsOpen(true),
        { shiftKey: true, enabled: !isOpen }
    );

    // Listen for Escape to close modal
    useKeyboardShortcut(
        'Escape',
        () => setIsOpen(false),
        { enabled: isOpen }
    );

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-40 p-3 bg-gray-900 border border-gray-700 rounded-full hover:border-neon-cyan hover:text-neon-cyan transition-colors text-gray-400 shadow-lg"
                title="Keyboard Shortcuts (Shift + ?)"
                aria-label="Show keyboard shortcuts"
            >
                <Keyboard size={20} />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl"
                            role="dialog"
                            aria-labelledby="shortcuts-title"
                            aria-modal="true"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neon-cyan/10 rounded border border-neon-cyan/30 text-neon-cyan">
                                        <Keyboard size={24} />
                                    </div>
                                    <h2 id="shortcuts-title" className="text-xl font-bold text-white font-display">
                                        Keyboard Shortcuts
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                    aria-label="Close keyboard shortcuts"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Shortcuts List */}
                            <div className="space-y-3">
                                {SHORTCUTS.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded bg-black/30 border border-gray-800"
                                    >
                                        <span className="text-gray-300 text-sm">
                                            {shortcut.description}
                                        </span>
                                        <kbd className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono text-neon-cyan">
                                            {formatShortcut(shortcut)}
                                        </kbd>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-800">
                                <p className="text-xs text-gray-500 text-center">
                                    Press <kbd className="px-2 py-1 bg-gray-800 rounded text-neon-cyan font-mono">Shift + ?</kbd> to toggle this menu
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
