import { describe, it, expect } from 'vitest';
import { isOwnedByControl } from '@/lib/keyboard-target';

describe('isOwnedByControl', () => {
    it('claims keys from buttons and elements inside a dialog', () => {
        document.body.innerHTML = '<div role="dialog"><span id="in">x</span></div><button id="btn">b</button><div id="canvas"></div>';
        expect(isOwnedByControl(document.getElementById('in'))).toBe(true);
        expect(isOwnedByControl(document.getElementById('btn'))).toBe(true);
    });
    it('leaves keys on the canvas and body to the graph', () => {
        expect(isOwnedByControl(document.getElementById('canvas'))).toBe(false);
        expect(isOwnedByControl(document.body)).toBe(false);
        expect(isOwnedByControl(null)).toBe(false);
    });
});

describe('isOwnedByControl with React Flow nodes', () => {
    it('leaves keys on a focused graph node to the graph', () => {
        const node = document.createElement('div');
        node.className = 'react-flow__node';
        node.setAttribute('role', 'button');
        document.body.appendChild(node);
        expect(isOwnedByControl(node)).toBe(false);
        const inner = document.createElement('button');
        node.appendChild(inner);
        expect(isOwnedByControl(inner)).toBe(true);
        node.remove();
    });
});
