export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  checked: boolean;
  category: string;
  notes?: string;
  statusColor: string; // Color representing the category
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingItem[];
  created_at: string;
  updated_at: string;
} 