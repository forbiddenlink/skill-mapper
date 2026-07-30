'use client';

import { useGameStore } from '@/lib/store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useToast } from '@/components/ui/Toast';

/** Global undo / redo shortcuts wired to the history slice. */
export default function UndoRedoShortcuts() {
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const { toast } = useToast();

  useKeyboardShortcuts([
    {
      key: 'z',
      metaKey: true,
      description: 'Undo',
      action: () => {
        if (undo()) toast.info('Undid last change');
      },
    },
    {
      key: 'z',
      ctrlKey: true,
      description: 'Undo',
      action: () => {
        if (undo()) toast.info('Undid last change');
      },
    },
    {
      key: 'z',
      metaKey: true,
      shiftKey: true,
      description: 'Redo',
      action: () => {
        if (redo()) toast.info('Redid change');
      },
    },
    {
      key: 'y',
      ctrlKey: true,
      description: 'Redo',
      action: () => {
        if (redo()) toast.info('Redid change');
      },
    },
  ]);

  return null;
}
