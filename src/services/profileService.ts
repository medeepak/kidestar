import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    gem_balance: number;
    is_onboarded: boolean;
    created_at: string;
}

export const profileService = {
    /**
     * Fetches the profile for the given user ID.
     * Upserts a default profile row if one doesn't exist yet (e.g. first Google login).
     */
    async getOrCreateProfile(userId: string): Promise<Profile> {
        // Try to fetch existing profile
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) {
            return data as Profile;
        }

        // Profile doesn't exist yet — create it with default gem balance
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({ id: userId, gem_balance: 200, is_onboarded: false })
            .select()
            .single();

        if (insertError) throw insertError;
        return newProfile as Profile;
    },
};
