import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export const eventService = {
  async getEvents(weddingId: string): Promise<EventRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('start_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createEvent(input: EventInsert): Promise<EventRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('events')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(id: string, updates: EventUpdate): Promise<EventRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
