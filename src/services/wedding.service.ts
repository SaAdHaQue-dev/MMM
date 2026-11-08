import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type WeddingRow = Database['public']['Tables']['weddings']['Row'];
export type WeddingInsert = Database['public']['Tables']['weddings']['Insert'];
export type WeddingUpdate = Database['public']['Tables']['weddings']['Update'];
export type WeddingMemberRow = Database['public']['Tables']['wedding_members']['Row'];

export const weddingService = {
  async getUserWeddings(): Promise<WeddingRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWeddingById(id: string): Promise<WeddingRow | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createWedding(input: WeddingInsert): Promise<WeddingRow> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase
      .from('weddings')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWedding(id: string, updates: WeddingUpdate): Promise<WeddingRow> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase
      .from('weddings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWeddingMembers(weddingId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('wedding_members')
      .select(`
        id,
        wedding_id,
        user_id,
        role,
        family_side,
        joined_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq('wedding_id', weddingId);

    if (error) throw error;
    return data || [];
  },

  async addMember(input: { wedding_id: string; user_id: string; role: 'admin' | 'member' | 'viewer'; family_side?: 'bride' | 'groom' }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('wedding_members')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(weddingId: string, userId: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('wedding_members')
      .delete()
      .eq('wedding_id', weddingId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
