import { useGameStore } from './store';

const APP_ID = 'skill-mapper';

type Persisted = Record<string, unknown>;

interface ProgressFile {
    app: typeof APP_ID;
    /** Store persist version the file was written with, used to migrate older files. */
    version: number;
    exportedAt: string;
    state: Persisted;
}

function persistOptions() {
    return useGameStore.persist.getOptions();
}

/** Serialise the same fields the app saves to IndexedDB, so the file is a full backup. */
export function buildProgressFile(): string {
    const { partialize, version } = persistOptions();
    const state = (partialize ? partialize(useGameStore.getState()) : {}) as Persisted;
    const file: ProgressFile = { app: APP_ID, version: version ?? 0, exportedAt: new Date().toISOString(), state };
    return JSON.stringify(file, null, 2);
}

/**
 * Validate and load a progress file. Throws an Error with a message safe to show the
 * user. Nothing is written until the whole file has passed validation.
 */
export function applyProgressFile(text: string): void {
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch {
        throw new Error('That file is not a valid progress file.');
    }

    const file = raw as Partial<ProgressFile> | null;
    const state = file?.state as Persisted | undefined;
    if (
        !file ||
        file.app !== APP_ID ||
        typeof file.version !== 'number' ||
        !state ||
        typeof state !== 'object' ||
        !Array.isArray(state.nodes)
    ) {
        throw new Error('That file is not a Skill Mapper progress file.');
    }

    const { version: currentVersion, migrate, merge } = persistOptions();
    if (file.version > (currentVersion ?? 0)) {
        throw new Error('That file was saved by a newer version of Skill Mapper. Update the app and try again.');
    }

    const migrated = migrate && file.version < (currentVersion ?? 0) ? migrate(state, file.version) : state;
    const current = useGameStore.getState();
    const next = merge ? merge(migrated, current) : { ...current, ...(migrated as object) };
    // setState triggers the persist middleware, which writes the result to IndexedDB.
    useGameStore.setState(next);
}
