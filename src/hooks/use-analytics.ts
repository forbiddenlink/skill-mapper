import { useCallback } from 'react';
import { config } from '@/lib/config';

/**
 * Analytics event types for tracking user interactions
 */
export type AnalyticsEvent = 
    | 'skill_unlocked'
    | 'skill_completed'
    | 'badge_earned'
    | 'level_up'
    | 'challenge_started'
    | 'challenge_completed'
    | 'challenge_failed'
    | 'progress_saved'
    | 'progress_loaded'
    | 'sound_toggled';

interface AnalyticsEventData {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Custom hook for analytics tracking
 * Can be extended to integrate with services like Google Analytics, Mixpanel, etc.
 */
export function useAnalytics() {
    const trackEvent = useCallback((event: AnalyticsEvent, data?: AnalyticsEventData) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Analytics Event:', event, data);
        }

        // Future: Send to analytics service
        // Example: gtag('event', event, data);
        // Example: mixpanel.track(event, data);
        
        // Store in localStorage for debugging (optional)
        if (config.features.sound) {
            try {
                const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
                events.push({
                    event,
                    data,
                    timestamp: Date.now(),
                });
                // Keep only last 100 events
                if (events.length > 100) {
                    events.shift();
                }
                localStorage.setItem('analytics_events', JSON.stringify(events));
            } catch (error) {
                console.warn('Failed to store analytics event:', error);
            }
        }
    }, []);

    const trackPageView = useCallback((page: string) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('📄 Page View:', page);
        }
        // Future: Send to analytics service
    }, []);

    const trackError = useCallback((error: Error, context?: string) => {
        console.error('❌ Error tracked:', error, context);
        // Future: Send to error tracking service like Sentry
    }, []);

    return {
        trackEvent,
        trackPageView,
        trackError,
    };
}
