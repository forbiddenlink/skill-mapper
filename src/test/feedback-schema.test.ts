import { describe, it, expect } from 'vitest';
import { skillFeedbackRequestSchema, skillFeedbackResponseSchema } from '@/lib/groq';

const valid = { skillName: 'React', skillCategory: 'frontend', userAnswer: 'hooks', challengeType: 'quiz' };

describe('feedback request schema', () => {
    it('accepts a normal request', () => {
        expect(skillFeedbackRequestSchema.safeParse(valid).success).toBe(true);
    });
    it('rejects oversize answers, unknown challenge types and missing fields', () => {
        expect(skillFeedbackRequestSchema.safeParse({ ...valid, userAnswer: 'x'.repeat(2001) }).success).toBe(false);
        expect(skillFeedbackRequestSchema.safeParse({ ...valid, challengeType: 'essay' }).success).toBe(false);
        expect(skillFeedbackRequestSchema.safeParse({ ...valid, skillName: '' }).success).toBe(false);
        expect(skillFeedbackRequestSchema.safeParse({ ...valid, userAnswer: 42 }).success).toBe(false);
    });
});

describe('feedback response schema', () => {
    it('rejects a model reply with the wrong shape', () => {
        expect(skillFeedbackResponseSchema.safeParse({ isCorrect: 'yes', feedback: 'ok', encouragement: 'go' }).success).toBe(false);
        expect(skillFeedbackResponseSchema.safeParse({ isCorrect: true, feedback: 'ok', encouragement: 'go' }).success).toBe(true);
    });
});
