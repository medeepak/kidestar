import { supabase } from '../lib/supabase';

// Generate a random UUID-like string if crypto.randomUUID isn't available
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const SESSION_KEY = 'kidestar_analytics_session_id';

/**
 * Gets or generates a persistent session_id for visitor tracking.
 */
export function getSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

/**
 * Logs an analytics event to Supabase user_events table.
 * Falls back to anonymous session tracking if the user is not signed in.
 */
export async function trackEvent(eventName: string, metadata: Record<string, any> = {}) {
    try {
        const sessionId = getSessionId();
        const pagePath = window.location.pathname;

        // Retrieve current authenticated user session if available
        const sessionRes = await supabase.auth.getSession();
        const userId = sessionRes.data.session?.user?.id || null;

        const eventData = {
            session_id: sessionId,
            event_name: eventName,
            page_path: pagePath,
            metadata: metadata || {},
            user_id: userId
        };

        // Fire-and-forget insert (async, non-blocking)
        supabase.from('user_events')
            .insert(eventData)
            .then(({ error }) => {
                if (error) {
                    console.error('Analytics tracking error:', error);
                }
            });
    } catch (e) {
        console.error('Failed to track event:', e);
    }
}
