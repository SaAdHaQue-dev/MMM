import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const BUCKET_NAME = 'wedding-files';

export const storageService = {
  /**
   * Upload a file into <wedding_id>/<folder>/<unique_filename>
   */
  async uploadWeddingFile(weddingId: string, folder: 'documents' | 'photos' | 'attachments', file: File) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    // Sanitize and generate unique filename
    const ext = file.name.split('.').pop();
    const cleanName = `${Date.now()}_${crypto.randomUUID()}.${ext}`;
    const filePath = `${weddingId}/${folder}/${cleanName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return { path: data.path, fullPath: data.fullPath };
  },

  /**
   * Creates a signed URL for temporary access to a private wedding file
   */
  async getSignedUrl(filePath: string, expiresInSeconds = 3600): Promise<string> {
    if (!isSupabaseConfigured) return '';
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Deletes a file from the private bucket
   */
  async deleteFile(filePath: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  },
};
