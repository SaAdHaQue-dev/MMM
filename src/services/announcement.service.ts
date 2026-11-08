import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];

export const announcementService = {
  async getAnnouncements(weddingId: string): Promise<AnnouncementRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAnnouncement(input: AnnouncementInsert): Promise<AnnouncementRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('announcements')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
