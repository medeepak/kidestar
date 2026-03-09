import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    gem_balance: number;
    is_onboarded: boolean;
    created_at: string;
}

export const MIN_GEM_COST = 30; // cheapest rhyme cost — used for Low Gem Alert threshold

export const profileService = {
    /**
     * Fetches the profile for the given user ID.
     * Upserts a default profile row if one doesn't exist yet (e.g. first Google login).
     */
    async getOrCreateProfile(userId: string): Promise<Profile> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) return data as Profile;

        // Profile doesn't exist yet — create with default gem balance
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({ id: userId, gem_balance: 200, is_onboarded: false })
            .select()
            .single();

        if (insertError) throw insertError;
        return newProfile as Profile;
    },

    /** Returns current gem balance without fetching the full profile. */
    async getGemBalance(userId: string): Promise<number> {
        const { data, error } = await supabase
            .from('profiles')
            .select('gem_balance')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return (data as { gem_balance: number }).gem_balance;
    },

    /**
     * Atomically deducts `amount` gems.
     * Throws 'Not enough gems' if the user has insufficient balance.
     * Uses a Postgres SECURITY DEFINER function to prevent race conditions.
     */
    async deductGems(userId: string, amount: number): Promise<number> {
        const { data, error } = await supabase.rpc('deduct_gems', {
            p_user_id: userId,
            p_amount: amount,
        });
        if (error) {
            throw new Error(
                error.message.includes('insufficient_gems') ? 'Not enough gems' : error.message
            );
        }
        return data as number;
    },

    /**
     * Atomically refunds `amount` gems back to the user's wallet.
     * Called by the edge function when a generation fails.
     */
    async refundGems(userId: string, amount: number): Promise<number> {
        const { data, error } = await supabase.rpc('refund_gems', {
            p_user_id: userId,
            p_amount: amount,
        });
        if (error) throw error;
        return data as number;
    },
};
