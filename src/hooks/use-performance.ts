import { useEffect, useRef } from 'react';

/**
 * Hook to measure component render performance
 * Useful for identifying performance bottlenecks
 * Note: Returns void as accessing refs during render is not allowed in React 19
 */
export function useRenderCount(componentName: string): void {
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current += 1;
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
        }
    });
}

/**
 * Hook to measure component mount/unmount timing
 */
export function useComponentLifecycle(componentName: string) {
    const mountTime = useRef<number>(0);
    
    useEffect(() => {
        mountTime.current = performance.now();
        if (process.env.NODE_ENV === 'development') {
            console.log(`⚡ ${componentName} mounted at ${mountTime.current.toFixed(2)}ms`);
        }
        
        return () => {
            const unmountTime = performance.now();
            const lifetime = unmountTime - mountTime.current;
            if (process.env.NODE_ENV === 'development') {
                console.log(`💀 ${componentName} unmounted after ${lifetime.toFixed(2)}ms`);
            }
        };
    }, [componentName]);
}

/**
 * Hook to measure async operation performance
 */
export function usePerformanceMark() {
    const mark = (name: string) => {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(name);
        }
    };
    
    const measure = (name: string, startMark: string, endMark: string) => {
        if (typeof performance !== 'undefined' && performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const measures = performance.getEntriesByName(name);
                if (measures.length > 0) {
                    const duration = measures[0]?.duration;
                    if (process.env.NODE_ENV === 'development' && duration !== undefined) {
                        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
                    }
                }
            } catch (error) {
                console.warn('Performance measurement failed:', error);
            }
        }
    };
    
    return { mark, measure };
}

/**
 * Hook to detect slow renders (> 16ms for 60fps)
 */
export function useSlowRenderDetection(componentName: string, threshold = 16) {
    const lastRenderTime = useRef<number>(0);
    
    useEffect(() => {
        const renderTime = performance.now();
        const renderDuration = renderTime - lastRenderTime.current;
        
        if (lastRenderTime.current > 0 && renderDuration > threshold) {
            console.warn(
                `⚠️ Slow render detected in ${componentName}: ${renderDuration.toFixed(2)}ms (threshold: ${threshold}ms)`
            );
        }
        
        lastRenderTime.current = renderTime;
    });
}
