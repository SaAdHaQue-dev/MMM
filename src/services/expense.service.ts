import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export const expenseService = {
  async getExpenses(weddingId: string): Promise<ExpenseRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createExpense(input: ExpenseInsert): Promise<ExpenseRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('expenses')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, updates: ExpenseUpdate): Promise<ExpenseRow> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getExpenseSummary(weddingId: string) {
    const expenses = await this.getExpenses(weddingId);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalPaid = expenses.reduce((sum, e) => sum + Number(e.paid_amount || 0), 0);
    const outstanding = totalExpenses - totalPaid;

    const brideTotal = expenses
      .filter(e => e.family_side === 'bride')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const groomTotal = expenses
      .filter(e => e.family_side === 'groom')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      totalExpenses,
      totalPaid,
      outstanding,
      brideTotal,
      groomTotal,
      count: expenses.length,
    };
  },
};
