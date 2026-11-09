/**
 * True when a key event belongs to a control or an open dialog rather than the
 * canvas. Global graph shortcuts must skip these, or Enter on a dialog button
 * toggles a branch instead of pressing the button.
 */
export function isOwnedByControl(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    if (target.closest('[role="dialog"], [role="alertdialog"]')) return true;
    if (target instanceof HTMLElement && target.isContentEditable) return true;
    return !!target.closest('button, a[href], input, textarea, select, [role="button"], [role="menuitem"], [role="tab"]');
}
