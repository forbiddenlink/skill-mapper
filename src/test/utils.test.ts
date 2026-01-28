import { describe, it, expect } from 'vitest';
import {
    formatNumber,
    calculatePercentage,
    safeJsonParse,
    generateId,
    formatRelativeTime,
} from '@/lib/utils';

describe('Utils', () => {
    describe('formatNumber', () => {
        it('should format numbers with commas', () => {
            expect(formatNumber(1000)).toBe('1,000');
            expect(formatNumber(1000000)).toBe('1,000,000');
            expect(formatNumber(42)).toBe('42');
        });
    });

    describe('calculatePercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(calculatePercentage(50, 200)).toBe(25);
            expect(calculatePercentage(1, 4)).toBe(25);
            expect(calculatePercentage(3, 4)).toBe(75);
        });

        it('should handle zero total', () => {
            expect(calculatePercentage(50, 0)).toBe(0);
        });

        it('should respect decimal places', () => {
            expect(calculatePercentage(1, 3, 2)).toBe(33.33);
        });
    });

    describe('safeJsonParse', () => {
        it('should parse valid JSON', () => {
            const json = '{"name":"test","value":42}';
            const result = safeJsonParse(json, {});
            expect(result).toEqual({ name: 'test', value: 42 });
        });

        it('should return fallback for invalid JSON', () => {
            const fallback = { default: true };
            const result = safeJsonParse('invalid json', fallback);
            expect(result).toEqual(fallback);
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('formatRelativeTime', () => {
        it('should format recent timestamps', () => {
            const now = Date.now();
            expect(formatRelativeTime(now)).toBe('just now');
            expect(formatRelativeTime(now - 30000)).toBe('just now');
        });

        it('should format minutes ago', () => {
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
        });

        it('should format hours ago', () => {
            const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
            expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
        });

        it('should format days ago', () => {
            const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
            expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
        });
    });
});
