import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type GenerationStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface GenerationRecord {
    id: string;
    user_id: string;
    avatar_id: string;
    rhyme_slug: string;
    status: GenerationStatus;
    video_url: string | null;
    created_at: string;
}

export const rhymeService = {
    // ── Trigger ────────────────────────────────────────────────────────────────

    /**
     * Fire-and-forget: triggers the n8n workflow via an Edge Function proxy.
     * When n8n finishes it will call the `rhyme-generation-complete` Edge Function
     * which updates the DB. Frontend never waits for the result.
     */
    async triggerGeneration(_userId: string, avatarUrl: string, rhymeSlug: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-rhyme-generation`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rhyme_slug: rhymeSlug, avatar_url: avatarUrl }),
            }
        );

        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.error || `Trigger failed: ${res.status}`);
        }
    },

    // ── DB Generation Record ──────────────────────────────────────────────────

    /**
     * Upserts a generation record (one per user+rhyme).
     * Resets status to 'pending' whenever (re-)generated.
     */
    async upsertGenerationRecord(userId: string, avatarId: string, rhymeSlug: string): Promise<GenerationRecord> {
        const { data, error } = await supabase
            .from('generations')
            .upsert(
                { user_id: userId, avatar_id: avatarId, rhyme_slug: rhymeSlug, status: 'pending', video_url: null },
                { onConflict: 'user_id,rhyme_slug' }
            )
            .select()
            .single();

        if (error) throw error;
        return data as GenerationRecord;
    },

    /**
     * Gets the current generation record for this user + rhyme, or null if ungenerated.
     */
    async getGenerationRecord(userId: string, rhymeSlug: string): Promise<GenerationRecord | null> {
        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', userId)
            .eq('rhyme_slug', rhymeSlug)
            .maybeSingle();

        if (error) {
            console.error('Error fetching generation record:', error);
            return null;
        }
        return data as GenerationRecord | null;
    },

    async markGenerationReady(generationId: string, videoUrl: string): Promise<void> {
        await supabase
            .from('generations')
            .update({ status: 'ready', video_url: videoUrl })
            .eq('id', generationId);
    },

    async markGenerationFailed(generationId: string): Promise<void> {
        await supabase
            .from('generations')
            .update({ status: 'failed', video_url: null })
            .eq('id', generationId);
    },

    /**
     * One-shot check: looks for the video in Storage for this user+rhyme.
     * If found, marks the DB record ready and returns the video URL.
     * If not found, returns null.
     */
    async checkStorageAndUpdate(userId: string, rhymeSlug: string, generationId: string): Promise<string | null> {
        const VIDEO_PATHS: Record<string, string> = {
            'wheels-on-the-bus': 'wheels_on_the_bus/final_video.mp4',
        };
        const filePath = VIDEO_PATHS[rhymeSlug];
        if (!filePath) return null;

        const storagePath = `${userId}/${filePath}`;

        const { data } = await supabase.storage
            .from('videos')
            .list(`${userId}/${filePath.split('/')[0]}`, { search: filePath.split('/')[1] });

        if (!data || data.length === 0) return null;

        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(storagePath);
        const url = urlData?.publicUrl;
        if (!url) return null;

        await rhymeService.markGenerationReady(generationId, url);
        return url;
    },

    // ── Realtime subscription ─────────────────────────────────────────────────

    /**
     * Subscribes to real-time changes on a specific generation record.
     * When the record moves to 'ready' or 'failed', the callback fires.
     * No polling, no timeouts — n8n calls rhyme-generation-complete when done.
     *
     * Returns the channel so the caller can unsubscribe on cleanup.
     */
    subscribeToGeneration(
        generationId: string,
        onUpdate: (record: GenerationRecord) => void
    ): RealtimeChannel {
        const channel = supabase
            .channel(`generation:${generationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'generations',
                    filter: `id=eq.${generationId}`,
                },
                (payload) => {
                    onUpdate(payload.new as GenerationRecord);
                }
            )
            .subscribe();

        return channel;
    },

    unsubscribeFromGeneration(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    },
};
