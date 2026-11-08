import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type GuestRow = Database['public']['Tables']['guests']['Row'];
export type GuestInsert = Database['public']['Tables']['guests']['Insert'];
export type GuestUpdate = Database['public']['Tables']['guests']['Update'];

export const guestService = {
  async getGuests(weddingId: string): Promise<GuestRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createGuest(input: GuestInsert): Promise<GuestRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('guests')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGuest(id: string, updates: GuestUpdate): Promise<GuestRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGuest(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getGuestSummary(weddingId: string) {
    const guests = await this.getGuests(weddingId);
    const totalGuests = guests.reduce((sum, g) => sum + (g.guest_count || 1), 0);
    const acceptedCount = guests
      .filter(g => g.rsvp_status === 'accepted')
      .reduce((sum, g) => sum + (g.guest_count || 1), 0);
    const pendingCount = guests
      .filter(g => g.rsvp_status === 'pending')
      .reduce((sum, g) => sum + (g.guest_count || 1), 0);
    const declinedCount = guests
      .filter(g => g.rsvp_status === 'declined')
      .reduce((sum, g) => sum + (g.guest_count || 1), 0);

    return {
      totalGuests,
      acceptedCount,
      pendingCount,
      declinedCount,
      totalEntries: guests.length,
    };
  },
};
