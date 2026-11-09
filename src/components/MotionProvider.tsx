'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Makes every motion/react animation honor prefers-reduced-motion. Transform and
 * layout animations are skipped for those users; opacity fades still run.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
