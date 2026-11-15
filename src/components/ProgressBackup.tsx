'use client';

import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { applyProgressFile, buildProgressFile } from '@/lib/progress-file';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function ProgressBackup() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

    const handleExport = () => {
        const blob = new Blob([buildProgressFile()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `skill-mapper-progress-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setMessage({ kind: 'ok', text: 'Progress file downloaded.' });
    };

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        try {
            if (file.size > MAX_FILE_BYTES) throw new Error('That file is too large to be a progress file.');
            if (!window.confirm('Replace the progress in this browser with the contents of this file?')) return;
            applyProgressFile(await file.text());
            setMessage({ kind: 'ok', text: 'Progress restored from file.' });
        } catch (error) {
            setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Could not read that file.' });
        } finally {
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="mt-8">
            <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wider text-foreground">Back up progress</h3>
            <p className="mb-3 text-xs text-text-muted">
                Progress is stored only in this browser. Download a file to keep a copy or move to another device.
            </p>
            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleExport} className="icon-btn inline-flex items-center gap-2 px-3 py-2 text-sm">
                    <Download size={16} aria-hidden="true" /> Download progress
                </button>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="icon-btn inline-flex items-center gap-2 px-3 py-2 text-sm"
                >
                    <Upload size={16} aria-hidden="true" /> Restore from file
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    aria-label="Progress file to restore"
                    tabIndex={-1}
                    onChange={(e) => void handleFile(e.target.files?.[0])}
                />
            </div>
            <p role="status" className={`mt-2 text-xs ${message?.kind === 'error' ? 'text-decay' : 'text-text-muted'}`}>
                {message?.text}
            </p>
        </div>
    );
}
