import * as XLSX from 'xlsx';
import { BudgetPlan, MonthlyPaymentPlan } from '../types/budget';
import { ShoppingList } from '../types/shopping';
import { BudgetService } from './budgetService';
import { ShoppingListService } from './shoppingListService';

export interface ExportData {
  budgetPlans: BudgetPlan[];
  paymentPlans: MonthlyPaymentPlan[];
  shoppingLists: ShoppingList[];
  exportDate: string;
  userId: string;
}

export class DataExportService {
  static async exportUserData(userId: string): Promise<void> {
    try {
      // Fetch all user data
      const [budgetPlans, paymentPlans, shoppingLists] = await Promise.all([
        BudgetService.getUserBudgetPlans(userId),
        BudgetService.getUserPaymentPlans(userId),
        ShoppingListService.getLists(userId)
      ]);

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Export Budget Plans
      this.addBudgetPlansSheet(workbook, budgetPlans);

      // Export Budget Details (Income & Expenses)
      this.addBudgetDetailsSheet(workbook, budgetPlans);

      // Export Payment Plans
      this.addPaymentPlansSheet(workbook, paymentPlans);

      // Export Shopping Lists
      this.addShoppingListsSheet(workbook, shoppingLists);

      // Export Summary
      this.addSummarySheet(workbook, { budgetPlans, paymentPlans, shoppingLists, exportDate: new Date().toISOString(), userId });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `FinanceHub_Export_${timestamp}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  private static addBudgetPlansSheet(workbook: XLSX.WorkBook, budgetPlans: BudgetPlan[]): void {
    const data = budgetPlans.map(plan => ({
      'Plan Name': plan.name,
      'Month': plan.month,
      'Year': plan.year,
      'Total Income (LEI)': plan.total_income,
      'Total Expenses (LEI)': plan.total_expenses,
      'Leftover Amount (LEI)': plan.leftover_amount,
      'Created Date': new Date(plan.created_at).toLocaleDateString(),
      'Last Updated': new Date(plan.updated_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 25 }, // Plan Name
      { width: 10 }, // Month
      { width: 10 }, // Year
      { width: 15 }, // Total Income
      { width: 15 }, // Total Expenses
      { width: 15 }, // Leftover Amount
      { width: 15 }, // Created Date
      { width: 15 }  // Last Updated
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget Plans');
  }

  private static addBudgetDetailsSheet(workbook: XLSX.WorkBook, budgetPlans: BudgetPlan[]): void {
    const incomeData: any[] = [];
    const expenseData: any[] = [];

    budgetPlans.forEach(plan => {
      // Income items
      plan.income_items.forEach(item => {
        incomeData.push({
          'Budget Plan': plan.name,
          'Month/Year': `${plan.month}/${plan.year}`,
          'Income Source': item.name,
          'Type': item.type,
          'Amount (LEI)': item.amount
        });
      });

      // Expense items
      plan.expense_items.forEach(item => {
        expenseData.push({
          'Budget Plan': plan.name,
          'Month/Year': `${plan.month}/${plan.year}`,
          'Expense Name': item.name,
          'Category': item.category,
          'Subcategory': item.subcategory,
          'Planned Amount (LEI)': item.planned,
          'Actual Amount (LEI)': item.actual,
          'Variance (LEI)': item.actual - item.planned
        });
      });
    });

    // Create Income sheet
    if (incomeData.length > 0) {
      const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
      incomeSheet['!cols'] = [
        { width: 25 }, // Budget Plan
        { width: 12 }, // Month/Year
        { width: 20 }, // Income Source
        { width: 12 }, // Type
        { width: 15 }  // Amount
      ];
      XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Details');
    }

    // Create Expenses sheet
    if (expenseData.length > 0) {
      const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
      expenseSheet['!cols'] = [
        { width: 25 }, // Budget Plan
        { width: 12 }, // Month/Year
        { width: 20 }, // Expense Name
        { width: 12 }, // Category
        { width: 15 }, // Subcategory
        { width: 15 }, // Planned Amount
        { width: 15 }, // Actual Amount
        { width: 15 }  // Variance
      ];
      XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Details');
    }
  }

  private static addPaymentPlansSheet(workbook: XLSX.WorkBook, paymentPlans: MonthlyPaymentPlan[]): void {
    const data: any[] = [];

    paymentPlans.forEach(plan => {
      plan.payment_items.forEach(item => {
        data.push({
          'Payment Plan': plan.name,
          'Month/Year': `${plan.month}/${plan.year}`,
          'Payment Name': item.name,
          'Amount (LEI)': item.amount,
          'Due Date': item.dueDate,
          'Category': item.category,
          'Profile Type': item.profileType,
          'Status': item.isPaid ? 'Paid' : 'Pending',
          'Payment Method': item.paymentMethod || '',
          'Notes': item.notes || ''
        });
      });
    });

    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet['!cols'] = [
        { width: 25 }, // Payment Plan
        { width: 12 }, // Month/Year
        { width: 20 }, // Payment Name
        { width: 15 }, // Amount
        { width: 12 }, // Due Date
        { width: 12 }, // Category
        { width: 12 }, // Profile Type
        { width: 10 }, // Status
        { width: 15 }, // Payment Method
        { width: 30 }  // Notes
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Tracker');
    }
  }

  private static addShoppingListsSheet(workbook: XLSX.WorkBook, shoppingLists: ShoppingList[]): void {
    const data: any[] = [];

    shoppingLists.forEach(list => {
      list.items.forEach(item => {
        data.push({
          'List Name': list.name,
          'Item Name': item.name,
          'Quantity': item.quantity || 1,
          'Category': item.category || '',
          'Status': item.checked ? 'Completed' : 'Pending',
          'Notes': item.notes || '',
          'Created Date': new Date(list.created_at).toLocaleDateString()
        });
      });
    });

    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet['!cols'] = [
        { width: 20 }, // List Name
        { width: 20 }, // Item Name
        { width: 10 }, // Quantity
        { width: 15 }, // Category
        { width: 12 }, // Status
        { width: 30 }, // Notes
        { width: 15 }  // Created Date
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shopping Lists');
    }
  }

  private static addSummarySheet(workbook: XLSX.WorkBook, exportData: ExportData): void {
    const totalIncome = exportData.budgetPlans.reduce((sum, plan) => sum + plan.total_income, 0);
    const totalExpenses = exportData.budgetPlans.reduce((sum, plan) => sum + plan.total_expenses, 0);
    const totalPayments = exportData.paymentPlans.reduce((sum, plan) => sum + plan.total_amount, 0);
    const totalPaidPayments = exportData.paymentPlans.reduce((sum, plan) => sum + plan.paid_amount, 0);

    const summaryData = [
      { 'Category': 'Export Information', 'Value': '', 'Details': '' },
      { 'Category': 'Export Date', 'Value': new Date(exportData.exportDate).toLocaleDateString(), 'Details': 'Date when this export was generated' },
      { 'Category': 'User ID', 'Value': exportData.userId, 'Details': 'Unique user identifier' },
      { 'Category': '', 'Value': '', 'Details': '' },
      
      { 'Category': 'Budget Summary', 'Value': '', 'Details': '' },
      { 'Category': 'Total Budget Plans', 'Value': exportData.budgetPlans.length, 'Details': 'Number of budget plans created' },
      { 'Category': 'Total Income (LEI)', 'Value': totalIncome, 'Details': 'Sum of all planned income across all budgets' },
      { 'Category': 'Total Expenses (LEI)', 'Value': totalExpenses, 'Details': 'Sum of all planned expenses across all budgets' },
      { 'Category': 'Net Savings (LEI)', 'Value': totalIncome - totalExpenses, 'Details': 'Total income minus total expenses' },
      { 'Category': '', 'Value': '', 'Details': '' },
      
      { 'Category': 'Payment Summary', 'Value': '', 'Details': '' },
      { 'Category': 'Total Payment Plans', 'Value': exportData.paymentPlans.length, 'Details': 'Number of payment tracking plans' },
      { 'Category': 'Total Payments (LEI)', 'Value': totalPayments, 'Details': 'Sum of all tracked payments' },
      { 'Category': 'Total Paid (LEI)', 'Value': totalPaidPayments, 'Details': 'Sum of all completed payments' },
      { 'Category': 'Payment Completion Rate', 'Value': totalPayments > 0 ? `${((totalPaidPayments / totalPayments) * 100).toFixed(1)}%` : '0%', 'Details': 'Percentage of payments completed' },
      { 'Category': '', 'Value': '', 'Details': '' },
      
      { 'Category': 'Shopping Lists', 'Value': '', 'Details': '' },
      { 'Category': 'Total Shopping Lists', 'Value': exportData.shoppingLists.length, 'Details': 'Number of shopping lists created' },
      { 'Category': 'Total Items', 'Value': exportData.shoppingLists.reduce((sum, list) => sum + list.items.length, 0), 'Details': 'Total number of shopping items across all lists' },
      { 'Category': 'Completed Items', 'Value': exportData.shoppingLists.reduce((sum, list) => sum + list.items.filter(item => item.checked).length, 0), 'Details': 'Number of completed shopping items' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    worksheet['!cols'] = [
      { width: 25 }, // Category
      { width: 20 }, // Value
      { width: 40 }  // Details
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  }

  static async exportBudgetPlanOnly(budgetPlan: BudgetPlan): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // Budget Overview
      const overviewData = [
        { 'Field': 'Budget Name', 'Value': budgetPlan.name },
        { 'Field': 'Month', 'Value': budgetPlan.month },
        { 'Field': 'Year', 'Value': budgetPlan.year },
        { 'Field': 'Total Income (LEI)', 'Value': budgetPlan.total_income },
        { 'Field': 'Total Expenses (LEI)', 'Value': budgetPlan.total_expenses },
        { 'Field': 'Leftover Amount (LEI)', 'Value': budgetPlan.leftover_amount },
        { 'Field': 'Created Date', 'Value': new Date(budgetPlan.created_at).toLocaleDateString() },
        { 'Field': 'Last Updated', 'Value': new Date(budgetPlan.updated_at).toLocaleDateString() }
      ];

      const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
      overviewSheet['!cols'] = [{ width: 20 }, { width: 25 }];
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Budget Overview');

      // Income Details
      if (budgetPlan.income_items.length > 0) {
        const incomeData = budgetPlan.income_items.map(item => ({
          'Income Source': item.name,
          'Type': item.type,
          'Amount (LEI)': item.amount
        }));

        const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
        incomeSheet['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }];
        XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Sources');
      }

      // Expense Details
      if (budgetPlan.expense_items.length > 0) {
        const expenseData = budgetPlan.expense_items.map(item => ({
          'Expense Name': item.name,
          'Category': item.category,
          'Subcategory': item.subcategory,
          'Planned Amount (LEI)': item.planned,
          'Actual Amount (LEI)': item.actual,
          'Variance (LEI)': item.actual - item.planned,
          'Variance %': item.planned > 0 ? (((item.actual - item.planned) / item.planned) * 100).toFixed(1) + '%' : '0%'
        }));

        const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
        expenseSheet['!cols'] = [
          { width: 25 }, // Expense Name
          { width: 12 }, // Category
          { width: 15 }, // Subcategory
          { width: 15 }, // Planned Amount
          { width: 15 }, // Actual Amount
          { width: 15 }, // Variance
          { width: 12 }  // Variance %
        ];
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Details');
      }

      // Allocation Targets
      if (budgetPlan.allocation_targets.length > 0) {
        const allocationData = budgetPlan.allocation_targets.map(target => {
          const amount = target.type === 'percentage' 
            ? (budgetPlan.leftover_amount * target.value) / 100 
            : target.value;
          
          return {
            'Allocation Name': target.name,
            'Type': target.type,
            'Target Value': target.type === 'percentage' ? target.value + '%' : target.value + ' LEI',
            'Allocated Amount (LEI)': amount.toFixed(2),
            'Priority': target.priority
          };
        });

        const allocationSheet = XLSX.utils.json_to_sheet(allocationData);
        allocationSheet['!cols'] = [
          { width: 20 }, // Allocation Name
          { width: 12 }, // Type
          { width: 15 }, // Target Value
          { width: 18 }, // Allocated Amount
          { width: 10 }  // Priority
        ];
        XLSX.utils.book_append_sheet(workbook, allocationSheet, 'Allocations');
      }

      const filename = `${budgetPlan.name.replace(/[^a-zA-Z0-9]/g, '_')}_Export.xlsx`;
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Error exporting budget plan:', error);
      throw new Error('Failed to export budget plan. Please try again.');
    }
  }

  private static addPaymentPlansSheet(workbook: XLSX.WorkBook, paymentPlans: MonthlyPaymentPlan[]): void {
    const data: any[] = [];

    paymentPlans.forEach(plan => {
      // Add plan summary first
      data.push({
        'Type': 'Plan Summary',
        'Plan Name': plan.name,
        'Month/Year': `${plan.month}/${plan.year}`,
        'Payment Name': '',
        'Amount (LEI)': plan.total_amount,
        'Due Date': '',
        'Category': '',
        'Profile Type': '',
        'Status': `${plan.payment_items.filter(i => i.isPaid).length}/${plan.payment_items.length} paid`,
        'Notes': `Total: ${plan.total_amount} LEI, Paid: ${plan.paid_amount} LEI, Remaining: ${plan.remaining_amount} LEI`
      });

      // Add individual payments
      plan.payment_items.forEach(item => {
        data.push({
          'Type': 'Payment Item',
          'Plan Name': plan.name,
          'Month/Year': `${plan.month}/${plan.year}`,
          'Payment Name': item.name,
          'Amount (LEI)': item.amount,
          'Due Date': item.dueDate,
          'Category': item.category,
          'Profile Type': item.profileType,
          'Status': item.isPaid ? 'Paid' : 'Pending',
          'Notes': item.notes || ''
        });
      });

      // Add separator
      data.push({
        'Type': '',
        'Plan Name': '',
        'Month/Year': '',
        'Payment Name': '',
        'Amount (LEI)': '',
        'Due Date': '',
        'Category': '',
        'Profile Type': '',
        'Status': '',
        'Notes': ''
      });
    });

    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet['!cols'] = [
        { width: 15 }, // Type
        { width: 25 }, // Plan Name
        { width: 12 }, // Month/Year
        { width: 20 }, // Payment Name
        { width: 15 }, // Amount
        { width: 12 }, // Due Date
        { width: 12 }, // Category
        { width: 12 }, // Profile Type
        { width: 10 }, // Status
        { width: 30 }  // Notes
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Plans');
    }
  }

  private static addShoppingListsSheet(workbook: XLSX.WorkBook, shoppingLists: ShoppingList[]): void {
    const data: any[] = [];

    shoppingLists.forEach(list => {
      // Add list summary
      data.push({
        'Type': 'List Summary',
        'List Name': list.name,
        'Item Name': '',
        'Quantity': list.items.length,
        'Category': '',
        'Status': `${list.items.filter(i => i.checked).length}/${list.items.length} completed`,
        'Notes': `Created: ${new Date(list.created_at).toLocaleDateString()}`,
        'Status Color': ''
      });

      // Add individual items
      list.items.forEach(item => {
        data.push({
          'Type': 'Shopping Item',
          'List Name': list.name,
          'Item Name': item.name,
          'Quantity': item.quantity || 1,
          'Category': item.category || '',
          'Status': item.checked ? 'Completed' : 'Pending',
          'Notes': item.notes || '',
          'Status Color': item.statusColor || ''
        });
      });

      // Add separator
      data.push({
        'Type': '',
        'List Name': '',
        'Item Name': '',
        'Quantity': '',
        'Category': '',
        'Status': '',
        'Notes': '',
        'Status Color': ''
      });
    });

    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet['!cols'] = [
        { width: 15 }, // Type
        { width: 20 }, // List Name
        { width: 20 }, // Item Name
        { width: 10 }, // Quantity
        { width: 15 }, // Category
        { width: 12 }, // Status
        { width: 30 }, // Notes
        { width: 12 }  // Status Color
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shopping Lists');
    }
  }

  private static addSummarySheet(workbook: XLSX.WorkBook, exportData: ExportData): void {
    const totalIncome = exportData.budgetPlans.reduce((sum, plan) => sum + plan.total_income, 0);
    const totalExpenses = exportData.budgetPlans.reduce((sum, plan) => sum + plan.total_expenses, 0);
    const totalActualExpenses = exportData.budgetPlans.reduce((sum, plan) => 
      sum + plan.expense_items.reduce((expSum, item) => expSum + item.actual, 0), 0
    );
    const totalPayments = exportData.paymentPlans.reduce((sum, plan) => sum + plan.total_amount, 0);
    const totalPaidPayments = exportData.paymentPlans.reduce((sum, plan) => sum + plan.paid_amount, 0);

    const summaryData = [
      { 'Metric': 'Export Summary', 'Value': '', 'Description': '' },
      { 'Metric': 'Export Date', 'Value': new Date(exportData.exportDate).toLocaleDateString(), 'Description': 'Date of data export' },
      { 'Metric': 'Total Data Points', 'Value': exportData.budgetPlans.length + exportData.paymentPlans.length + exportData.shoppingLists.length, 'Description': 'Total number of records exported' },
      { 'Metric': '', 'Value': '', 'Description': '' },
      
      { 'Metric': 'Financial Overview', 'Value': '', 'Description': '' },
      { 'Metric': 'Total Planned Income (LEI)', 'Value': totalIncome, 'Description': 'Sum of all income across budget plans' },
      { 'Metric': 'Total Planned Expenses (LEI)', 'Value': totalExpenses, 'Description': 'Sum of all planned expenses' },
      { 'Metric': 'Total Actual Expenses (LEI)', 'Value': totalActualExpenses, 'Description': 'Sum of all actual expenses recorded' },
      { 'Metric': 'Planned Savings (LEI)', 'Value': totalIncome - totalExpenses, 'Description': 'Planned income minus planned expenses' },
      { 'Metric': 'Actual Savings (LEI)', 'Value': totalIncome - totalActualExpenses, 'Description': 'Planned income minus actual expenses' },
      { 'Metric': 'Savings Rate (%)', 'Value': totalIncome > 0 ? (((totalIncome - totalActualExpenses) / totalIncome) * 100).toFixed(1) + '%' : '0%', 'Description': 'Percentage of income saved' },
      { 'Metric': '', 'Value': '', 'Description': '' },
      
      { 'Metric': 'Payment Tracking', 'Value': '', 'Description': '' },
      { 'Metric': 'Total Tracked Payments (LEI)', 'Value': totalPayments, 'Description': 'Sum of all payments being tracked' },
      { 'Metric': 'Total Paid Amount (LEI)', 'Value': totalPaidPayments, 'Description': 'Sum of completed payments' },
      { 'Metric': 'Payment Completion Rate (%)', 'Value': totalPayments > 0 ? ((totalPaidPayments / totalPayments) * 100).toFixed(1) + '%' : '0%', 'Description': 'Percentage of payments completed' },
      { 'Metric': '', 'Value': '', 'Description': '' },
      
      { 'Metric': 'Activity Summary', 'Value': '', 'Description': '' },
      { 'Metric': 'Budget Plans Created', 'Value': exportData.budgetPlans.length, 'Description': 'Number of budget plans' },
      { 'Metric': 'Payment Plans Created', 'Value': exportData.paymentPlans.length, 'Description': 'Number of payment tracking plans' },
      { 'Metric': 'Shopping Lists Created', 'Value': exportData.shoppingLists.length, 'Description': 'Number of shopping lists' },
      { 'Metric': 'Total Shopping Items', 'Value': exportData.shoppingLists.reduce((sum, list) => sum + list.items.length, 0), 'Description': 'Total items across all shopping lists' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    worksheet['!cols'] = [
      { width: 30 }, // Metric
      { width: 20 }, // Value
      { width: 40 }  // Description
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export Summary');

    const filename = `FinanceHub_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Error exporting summary:', error);
    throw new Error('Failed to export summary. Please try again.');
  }
  }
}