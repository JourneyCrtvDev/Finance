import { supabase } from '../lib/supabaseClient';
import { BudgetPlan, BudgetSummary, MonthlyPaymentPlan, PaymentItem } from '../types/budget';

export class BudgetService {
  static async createBudgetPlan(plan: Omit<BudgetPlan, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetPlan | null> {
    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .insert([{
          ...plan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) {
        console.error('Error creating budget plan:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating budget plan:', error);
      return null;
    }
  }

  static async getBudgetPlan(userId: string, month: number, year: number): Promise<BudgetPlan | null> {
    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();
      if (error) {
        console.error('Error fetching budget plan:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching budget plan:', error);
      return null;
    }
  }

  static async updateBudgetPlan(plan: BudgetPlan): Promise<BudgetPlan | null> {
    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .update({
          ...plan,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget plan:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating budget plan:', error);
      return null;
    }
  }

  static async getUserBudgetPlans(userId: string): Promise<BudgetPlan[]> {
    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) {
        console.error('Error fetching user budget plans:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user budget plans:', error);
      return [];
    }
  }

  static async deleteBudgetPlan(planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting budget plan:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting budget plan:', error);
      return false;
    }
  }

  static async getLatestBudgetPlan(userId: string): Promise<BudgetPlan | null> {
    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Error fetching latest budget plan:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching latest budget plan:', error);
      return null;
    }
  }

  static calculateBudgetSummary(plan: BudgetPlan): BudgetSummary {
    const totalIncome = plan.income_items.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = plan.expense_items.reduce((sum, item) => sum + item.planned, 0);
    const totalActualExpenses = plan.expense_items.reduce((sum, item) => sum + item.actual, 0);
    const leftoverAmount = totalIncome - totalExpenses;
    const actualLeftoverAmount = totalIncome - totalActualExpenses;

    // Calculate allocations based on targets
    const allocations = {
      savings: 0,
      emergency: 0,
      investments: 0,
      fun: 0
    };

    plan.allocation_targets.forEach(target => {
      const amount = target.type === 'percentage' 
        ? (leftoverAmount * target.value) / 100 
        : target.value;
      
      switch (target.id) {
        case 'savings':
          allocations.savings = amount;
          break;
        case 'emergency':
          allocations.emergency = amount;
          break;
        case 'investments':
          allocations.investments = amount;
          break;
        case 'fun':
          allocations.fun = amount;
          break;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      totalActualExpenses,
      leftoverAmount,
      actualLeftoverAmount,
      allocations
    };
  }

  // Payment Plan Methods
  static async createPaymentPlan(plan: Omit<MonthlyPaymentPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlyPaymentPlan | null> {
    try {
      const { data, error } = await supabase
        .from('monthly_payment_plans')
        .insert([{
          ...plan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) {
        console.error('Error creating payment plan:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating payment plan:', error);
      return null;
    }
  }

  static async getPaymentPlan(userId: string, month: number, year: number): Promise<MonthlyPaymentPlan | null> {
    try {
      const { data, error } = await supabase
        .from('monthly_payment_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();
      if (error) {
        console.error('Error fetching payment plan:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching payment plan:', error);
      return null;
    }
  }

  static async updatePaymentPlan(plan: MonthlyPaymentPlan): Promise<MonthlyPaymentPlan | null> {
    try {
      const { data, error } = await supabase
        .from('monthly_payment_plans')
        .update({
          ...plan,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment plan:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating payment plan:', error);
      return null;
    }
  }

  static async getUserPaymentPlans(userId: string): Promise<MonthlyPaymentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('monthly_payment_plans')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) {
        console.error('Error fetching user payment plans:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user payment plans:', error);
      return [];
    }
  }

  static calculatePaymentSummary(plan: MonthlyPaymentPlan) {
    const totalAmount = plan.payment_items.reduce((sum, item) => sum + item.amount, 0);
    const paidAmount = plan.payment_items
      .filter(item => item.isPaid)
      .reduce((sum, item) => sum + item.amount, 0);
    const remainingAmount = totalAmount - paidAmount;
    const paidCount = plan.payment_items.filter(item => item.isPaid).length;
    const totalCount = plan.payment_items.length;
    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      paidCount,
      totalCount,
      completionPercentage: totalCount > 0 ? (paidCount / totalCount) * 100 : 0
    };
  }
}