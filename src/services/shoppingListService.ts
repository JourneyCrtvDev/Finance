import { supabase } from '../lib/supabaseClient';
import { ShoppingList, ShoppingItem } from '../types/shopping';

export class ShoppingListService {
  static async getLists(userId: string): Promise<ShoppingList[]> {
    if (!supabase) {
      throw new Error('Database connection not available. Please check your configuration.');
    }
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createList(userId: string, name: string, items: ShoppingItem[]): Promise<ShoppingList | null> {
    if (!supabase) {
      throw new Error('Database connection not available. Please check your configuration.');
    }
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert([{ user_id: userId, name, items }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateList(listId: string, items: ShoppingItem[]): Promise<ShoppingList | null> {
    if (!supabase) {
      throw new Error('Database connection not available. Please check your configuration.');
    }
    const { data, error } = await supabase
      .from('shopping_lists')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', listId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteList(listId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Database connection not available. Please check your configuration.');
    }
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId);
    if (error) throw error;
  }

  static async reuseList(userId: string, list: ShoppingList): Promise<ShoppingList | null> {
    if (!supabase) {
      throw new Error('Database connection not available. Please check your configuration.');
    }
    // Duplicate the list with a new id and current timestamp
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert([{
        user_id: userId,
        name: list.name + ' (Copy)',
        items: list.items.map(item => ({ ...item, checked: false })),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
} 