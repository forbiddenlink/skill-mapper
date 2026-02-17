'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useState } from 'react';
import { useKeyboardShortcut, formatShortcut, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

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
    const closeModal = () => setIsOpen(false);
    const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, closeModal);

    // Listen for ? key to open modal
    useKeyboardShortcut(
        '?',
        () => setIsOpen(true),
        { shiftKey: true, enabled: !isOpen }
    );

    // Listen for Escape to close modal
    useKeyboardShortcut(
        'Escape',
        closeModal,
        { enabled: isOpen }
    );

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="icon-btn fixed bottom-6 right-6 z-30 grid place-items-center md:bottom-8 md:right-6"
                title="Keyboard Shortcuts (Shift + ?)"
                aria-label="Show keyboard shortcuts"
            >
                <Keyboard size={20} />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            ref={dialogRef}
                            className="modal-shell w-full max-w-2xl p-5 md:p-6"
                            role="dialog"
                            aria-labelledby="shortcuts-title"
                            aria-modal="true"
                            tabIndex={-1}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan">
                                        <Keyboard size={24} />
                                    </div>
                                    <h2 id="shortcuts-title" className="text-xl font-semibold text-white">
                                        Keyboard Shortcuts
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="icon-btn grid place-items-center"
                                    aria-label="Close keyboard shortcuts"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Shortcuts List */}
                            <div className="space-y-3">
                                {SHORTCUTS.map((shortcut) => (
                                    <div
                                        key={`${shortcut.key}-${shortcut.ctrlKey || ''}-${shortcut.shiftKey || ''}`}
                                        className="panel-base flex items-center justify-between p-3"
                                    >
                                        <span className="text-sm text-gray-200">
                                            {shortcut.description}
                                        </span>
                                        <kbd className="rounded-[8px] border border-white/20 bg-black/30 px-3 py-1.5 font-mono text-xs text-neon-cyan">
                                            {formatShortcut(shortcut)}
                                        </kbd>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="divider-soft mt-6 border-t pt-4">
                                <p className="text-center text-xs text-text-muted">
                                    Press <kbd className="rounded-[8px] border border-white/20 bg-black/30 px-2 py-1 font-mono text-neon-cyan">Shift + ?</kbd> to toggle this menu
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
