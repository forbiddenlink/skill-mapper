/**
 * Application Configuration
 * Centralized configuration for the Skill Mapper application
 */

export const config = {
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Skill Mapper',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    },
    features: {
        sound: process.env.NEXT_PUBLIC_ENABLE_SOUND !== 'false',
        animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false',
        decay: process.env.NEXT_PUBLIC_ENABLE_DECAY !== 'false',
    },
    gamification: {
        xpPerLevel: parseInt(process.env.NEXT_PUBLIC_XP_PER_LEVEL || '1000', 10),
        decayThresholdMs: parseInt(process.env.NEXT_PUBLIC_DECAY_THRESHOLD_MS || '2592000000', 10), // 30 days default
    },
    storage: {
        key: 'skill-mapper-storage',
        version: 1,
    },
} as const;

export type Config = typeof config;
