import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type DigitalInvitationRow = Database['public']['Tables']['digital_invitations']['Row'];
export type DigitalInvitationInsert = Database['public']['Tables']['digital_invitations']['Insert'];
export type DigitalInvitationUpdate = Database['public']['Tables']['digital_invitations']['Update'];

export const invitationService = {
  async getDigitalInvitation(weddingId: string): Promise<DigitalInvitationRow | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('digital_invitations')
      .select('*')
      .eq('wedding_id', weddingId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPublicInvitationBySlug(slug: string) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('digital_invitations')
      .select(`
        *,
        weddings (
          id,
          name,
          partner_one_name,
          partner_two_name,
          wedding_date,
          wedding_time,
          venue_name,
          venue_address,
          map_url,
          couple_photo_url
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertDigitalInvitation(input: DigitalInvitationInsert): Promise<DigitalInvitationRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('digital_invitations')
      .upsert(input, { onConflict: 'wedding_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createWorkspaceInvite(weddingId: string, email: string, role: 'admin' | 'member' | 'viewer') {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    // Generate secure random token
    const token = crypto.randomUUID();
    // Compute SHA-256 hash of token to store in database as required by superbase.md
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiration

    const { data: user } = await supabase.auth.getUser();

    const { data: invite, error } = await supabase
      .from('invitations')
      .insert({
        wedding_id: weddingId,
        email,
        role,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        invited_by: user.user?.id || '',
      })
      .select()
      .single();

    if (error) throw error;
    return { invite, rawToken: token };
  },
};
