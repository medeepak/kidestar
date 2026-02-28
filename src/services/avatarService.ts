import { supabase } from '../lib/supabase';

export interface Avatar {
    id: string;
    user_id: string;
    child_name: string;
    photo_url: string | null;
    mesh_url: string | null;
    status: 'generating' | 'ready' | 'failed';
    created_at: string;
}

export const avatarService = {
    async ensureAuthenticated() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            return session.user;
        }

        // Fallback to anonymous sign in for MVP
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error('Auth error:', error.message);
            throw error;
        }
        return data.user;
    },

    async createAvatar(childName: string, photoBase64: string): Promise<Avatar> {
        try {
            const user = await this.ensureAuthenticated();
            if (!user) throw new Error('Could not authenticate user');

            // Invoke the Edge Function to generate the avatar using OpenAI via native fetch
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token || '';

            console.log('Invoking generate-avatar edge function...');
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-avatar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ childName, photoBase64 })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Edge Function returned status: ${response.status}`);
            }

            const edgeData = await response.json();

            if (!edgeData?.success) {
                const errMsg = edgeData?.error || 'Unknown error returning from generate-avatar';
                console.error(errMsg);
                throw new Error(errMsg);
            }

            const photoUrl = edgeData.imageUrl;
            const meshUrl = 'mock_mesh_url.glb';

            // Ensure a profile exists for this user to satisfy foreign key constraints
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ id: user.id }, { onConflict: 'id' });

            if (profileError) {
                console.error('Error creating linked profile:', profileError);
                throw profileError;
            }

            const { data, error } = await supabase
                .from('avatars')
                .insert({
                    user_id: user.id,
                    child_name: childName,
                    photo_url: photoUrl,
                    mesh_url: meshUrl,
                    status: 'ready'
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error details:', error);
                throw error;
            }

            return data as Avatar;
        } catch (error) {
            console.error('Error creating avatar:', error);
            throw error;
        }
    },

    async getCurrentAvatar(): Promise<Avatar | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data, error } = await supabase
            .from('avatars')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') // Not found
                console.error('Error fetching avatar:', error);
            return null;
        }

        return data as Avatar;
    }
};
