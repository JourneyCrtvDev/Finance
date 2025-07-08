export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  type: 'main' | 'side' | 'other';
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'fixed' | 'variable';
  subcategory: string;
  planned: number;
  actual: number;
}

export interface AllocationTarget {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  priority: number;
}

export interface BudgetPlan {
  id: string;
  user_id: string;
  month: number;
  year: number;
  name: string;
  income_items: IncomeItem[];
  expense_items: ExpenseItem[];
  allocation_targets: AllocationTarget[];
  total_income: number;
  total_expenses: number;
  leftover_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  totalActualExpenses: number;
  leftoverAmount: number;
  actualLeftoverAmount: number;
  allocations: {
    savings: number;
    emergency: number;
    investments: number;
    fun: number;
  };
}

export interface PaymentItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // Format: YYYY-MM-DD
  isPaid: boolean;
  category: 'fixed' | 'variable';
  notes?: string;
  paymentMethod?: string;
}

export interface MonthlyPaymentPlan {
  id: string;
  user_id: string;
  month: number;
  year: number;
  name: string;
  payment_items: PaymentItem[];
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_EXPENSE_CATEGORIES = {
  fixed: [
    'Rent/Mortgage',
    'Utilities',
    'Insurance',
    'Subscriptions',
    'Loan Payments',
    'Phone Bill',
    'Internet'
  ],
  variable: [
    'Food & Groceries',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Personal Care',
    'Church',
    'Miscellaneous'
  ]
};

export const DEFAULT_ALLOCATIONS: AllocationTarget[] = [
  {
    id: 'savings',
    name: 'Savings',
    type: 'percentage',
    value: 30,
    priority: 1
  },
  {
    id: 'emergency',
    name: 'Emergency Fund',
    type: 'percentage',
    value: 20,
    priority: 2
  },
  {
    id: 'investments',
    name: 'Investments',
    type: 'percentage',
    value: 40,
    priority: 3
  },
  {
    id: 'fun',
    name: 'Fun Money',
    type: 'percentage',
    value: 10,
    priority: 4
  }
];