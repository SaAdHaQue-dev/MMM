import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database, Json } from '@/types/database.types';

export type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row'];

export const activityService = {
  async getLogs(weddingId: string): Promise<ActivityLogRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async logAction(weddingId: string, action: string, entityType?: string, entityId?: string, metadata: Json = {}) {
    if (!isSupabaseConfigured) return;
    const { data: user } = await supabase.auth.getUser();

    await supabase
      .from('activity_logs')
      .insert({
        wedding_id: weddingId,
        actor_id: user.user?.id || null,
        action,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata,
      });
  },
};
