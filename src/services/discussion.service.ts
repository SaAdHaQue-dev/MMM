import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type DiscussionRow = Database['public']['Tables']['discussions']['Row'];
export type DiscussionInsert = Database['public']['Tables']['discussions']['Insert'];

export const discussionService = {
  async getDiscussions(weddingId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        id,
        wedding_id,
        author_id,
        body,
        parent_id,
        created_at,
        updated_at,
        profiles:author_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createDiscussion(input: DiscussionInsert): Promise<DiscussionRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('discussions')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDiscussion(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('discussions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
