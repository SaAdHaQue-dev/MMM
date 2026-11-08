import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database, TaskStatus } from '@/types/database.types';

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const taskService = {
  async getTasks(weddingId: string): Promise<TaskRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTask(input: TaskInsert): Promise<TaskRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('tasks')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: TaskUpdate): Promise<TaskRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleTaskStatus(id: string, currentStatus: TaskStatus): Promise<TaskRow> {
    const nextStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    return this.updateTask(id, { status: nextStatus });
  },

  async deleteTask(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
