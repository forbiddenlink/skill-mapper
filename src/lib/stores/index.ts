/**
 * Store module barrel — modular slices + IndexedDB persistence helpers.
 * Primary app state lives in `src/lib/store.ts` (composed with these slices).
 */

export { createUISlice, type UISlice } from './ui-store';
export { createUndoRedoSlice, type UndoRedoSlice } from './undo-redo-store';
export { createSkillsSlice, type SkillsSlice } from './skills-store';
export { createUserSlice, type UserSlice } from './user-store';
export { idbStateStorage } from './idb-storage';
export type { RecommendedSkill, RecommendationReason } from './types';
