import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Loading spinner component with animated cyberpunk aesthetic
 */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
            <svg viewBox="0 0 50 50" className="w-full h-full">
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="80, 200"
                    className="text-neon-cyan"
                />
            </svg>
        </motion.div>
    );
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-white font-mono text-sm">{message}</p>
            </div>
        </div>
    );
}

/**
 * Skeleton loader for content placeholders
 */
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-800/50 rounded ${className}`} />
    );
}
