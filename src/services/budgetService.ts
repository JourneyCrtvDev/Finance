import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { BudgetPlan, BudgetSummary, MonthlyPaymentPlan, PaymentItem } from '../types/budget';

// Demo data for when Supabase is not configured
const DEMO_BUDGET_PLANS: BudgetPlan[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    name: 'January 2024 Budget',
    income_items: [
      { id: '1', name: 'Main Salary', amount: 8000, type: 'main' },
      { id: '2', name: 'Freelance', amount: 2000, type: 'side' }
    ],
    expense_items: [
      { id: '1', name: 'Rent', amount: 2500, category: 'fixed', subcategory: 'Rent/Mortgage', planned: 2500, actual: 0 },
      { id: '2', name: 'Groceries', amount: 1200, category: 'variable', subcategory: 'Food & Groceries', planned: 1200, actual: 0 },
      { id: '3', name: 'Utilities', amount: 400, category: 'fixed', subcategory: 'Utilities', planned: 400, actual: 0 }
    ],
    allocation_targets: [
      { id: 'savings', name: 'Savings', type: 'percentage', value: 30, priority: 1 },
      { id: 'emergency', name: 'Emergency Fund', type: 'percentage', value: 20, priority: 2 },
      { id: 'investments', name: 'Investments', type: 'percentage', value: 40, priority: 3 },
      { id: 'fun', name: 'Fun Money', type: 'percentage', value: 10, priority: 4 }
    ],
    total_income: 10000,
    total_expenses: 4100,
    leftover_amount: 5900,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Demo payment plans
const DEMO_PAYMENT_PLANS: MonthlyPaymentPlan[] = [
  {
    id: 'payment-demo-1',
    user_id: 'demo-user',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    name: `Payment Tracker ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    payment_items: [
      {
        id: '1',
        name: 'Rent',
        amount: 2500,
        dueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-10`,
        isPaid: false,
        category: 'fixed',
        notes: 'Monthly rent payment'
      },
      {
        id: '2',
        name: 'Gas Bill',
        amount: 200,
        dueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-18`,
        isPaid: false,
        category: 'fixed',
        notes: 'Natural gas utility'
      }
    ],
    total_amount: 2700,
    paid_amount: 0,
    remaining_amount: 2700,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export class BudgetService {
  static async createBudgetPlan(plan: Omit<BudgetPlan, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetPlan | null> {
    // If Supabase is not configured, simulate success and return demo data
    if (!isSupabaseConfigured || !supabase) {
      console.log('Demo mode: Budget plan created successfully');
      const newPlan: BudgetPlan = {
        ...plan,
        id: `demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      // Add to demo data
      DEMO_BUDGET_PLANS.unshift(newPlan);
      return newPlan;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      const plan = DEMO_BUDGET_PLANS.find(p => 
        p.user_id === userId && p.month === month && p.year === year
      );
      return plan || null;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      const index = DEMO_BUDGET_PLANS.findIndex(p => p.id === plan.id);
      if (index !== -1) {
        DEMO_BUDGET_PLANS[index] = { ...plan, updated_at: new Date().toISOString() };
        return DEMO_BUDGET_PLANS[index];
      }
      return null;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      return DEMO_BUDGET_PLANS.filter(p => p.user_id === userId);
    }

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
    if (!isSupabaseConfigured || !supabase) {
      const index = DEMO_BUDGET_PLANS.findIndex(p => p.id === planId);
      if (index !== -1) {
        DEMO_BUDGET_PLANS.splice(index, 1);
        return true;
      }
      return false;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      // Return the most recent demo plan
      const userPlans = DEMO_BUDGET_PLANS.filter(p => p.user_id === userId);
      if (userPlans.length === 0) return null;
      
      // Sort by year and month descending to get the latest
      userPlans.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      return userPlans[0];
    }

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
    if (!isSupabaseConfigured || !supabase) {
      console.log('Demo mode: Payment plan created successfully');
      const newPlan: MonthlyPaymentPlan = {
        ...plan,
        id: `payment-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      DEMO_PAYMENT_PLANS.unshift(newPlan);
      return newPlan;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      const plan = DEMO_PAYMENT_PLANS.find(p => 
        p.user_id === userId && p.month === month && p.year === year
      );
      return plan || null;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      const index = DEMO_PAYMENT_PLANS.findIndex(p => p.id === plan.id);
      if (index !== -1) {
        DEMO_PAYMENT_PLANS[index] = { ...plan, updated_at: new Date().toISOString() };
        return DEMO_PAYMENT_PLANS[index];
      }
      return null;
    }

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
    if (!isSupabaseConfigured || !supabase) {
      return DEMO_PAYMENT_PLANS.filter(p => p.user_id === userId);
    }

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