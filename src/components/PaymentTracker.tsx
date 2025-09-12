import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { BudgetService } from '../services/budgetService';
import { MonthlyPaymentPlan, PaymentItem } from '../types/budget';

interface PaymentTrackerProps {
  currentUserId: string | null;
  onNavigateBack: () => void;
}

// Romanian Lei currency symbol component
const LeiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <span className={`font-bold ${className.replace('w-4 h-4', 'text-xs')}`}>RON</span>
);

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ currentUserId, onNavigateBack }) => {
  const [paymentPlan, setPaymentPlan] = useState<MonthlyPaymentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentItem | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<PaymentItem>>({
    name: '',
    amount: 0,
    dueDate: '',
    category: 'fixed',
    notes: '',
    isPaid: false,
    profileType: 'personal',
  });
  const [selectedProfileType, setSelectedProfileType] = useState<'business' | 'personal'>('personal');

  useEffect(() => {
    if (currentUserId) {
      loadPaymentPlan();
    }
  }, [currentUserId]);

  const loadPaymentPlan = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      let plan = await BudgetService.getPaymentPlan(currentUserId, month, year);
      
      if (!plan) {
        // Create a new payment plan for this month
        const newPlan = {
          user_id: currentUserId,
          month,
          year,
          name: `Payment Tracker ${month}/${year}`,
          payment_items: [],
          total_amount: 0,
          paid_amount: 0,
          remaining_amount: 0
        };
        
        plan = await BudgetService.createPaymentPlan(newPlan);
      }
      
      setPaymentPlan(plan);
    } catch (error) {
      console.error('Error loading payment plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentPlan || !newPayment.name || !newPayment.amount || !newPayment.dueDate) return;

    const paymentItem: PaymentItem = {
      id: Date.now().toString(),
      name: newPayment.name,
      amount: newPayment.amount,
      dueDate: newPayment.dueDate,
      category: newPayment.category || 'fixed',
      notes: newPayment.notes || '',
      isPaid: false,
      profileType: selectedProfileType,
    };

    const updatedPlan: MonthlyPaymentPlan = {
      ...paymentPlan,
      payment_items: [...paymentPlan.payment_items, paymentItem]
    };

    const summary = BudgetService.calculatePaymentSummary(updatedPlan);
    updatedPlan.total_amount = summary.totalAmount;
    updatedPlan.paid_amount = summary.paidAmount;
    updatedPlan.remaining_amount = summary.remainingAmount;

    const result = await BudgetService.updatePaymentPlan(updatedPlan);
    if (result) {
      setPaymentPlan(result);
      setNewPayment({
        name: '',
        amount: 0,
        dueDate: '',
        category: 'fixed',
        notes: '',
        isPaid: false,
        profileType: 'personal',
      });
      setShowAddForm(false);
    }
  };

  const handleTogglePaid = async (paymentId: string) => {
    if (!paymentPlan) return;

    const updatedItems = paymentPlan.payment_items.map(item =>
      item.id === paymentId ? { ...item, isPaid: !item.isPaid } : item
    );

    const updatedPlan: MonthlyPaymentPlan = {
      ...paymentPlan,
      payment_items: updatedItems
    };

    const summary = BudgetService.calculatePaymentSummary(updatedPlan);
    updatedPlan.total_amount = summary.totalAmount;
    updatedPlan.paid_amount = summary.paidAmount;
    updatedPlan.remaining_amount = summary.remainingAmount;

    const result = await BudgetService.updatePaymentPlan(updatedPlan);
    if (result) {
      setPaymentPlan(result);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!paymentPlan) return;

    const updatedItems = paymentPlan.payment_items.filter(item => item.id !== paymentId);
    const updatedPlan: MonthlyPaymentPlan = {
      ...paymentPlan,
      payment_items: updatedItems
    };

    const summary = BudgetService.calculatePaymentSummary(updatedPlan);
    updatedPlan.total_amount = summary.totalAmount;
    updatedPlan.paid_amount = summary.paidAmount;
    updatedPlan.remaining_amount = summary.remainingAmount;

    const result = await BudgetService.updatePaymentPlan(updatedPlan);
    if (result) {
      setPaymentPlan(result);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dateString: string, isPaid: boolean) => {
    if (isPaid) return 'paid';
    
    const daysUntil = getDaysUntilDue(dateString);
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'soon';
    return 'normal';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading payment tracker...</p>
        </motion.div>
      </div>
    );
  }

  if (!paymentPlan) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Calendar className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">Payment Tracker Error</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Unable to load payment tracker</p>
        </motion.div>
      </div>
    );
  }

  const summary = BudgetService.calculatePaymentSummary(paymentPlan);
  const sortedPayments = [...paymentPlan.payment_items].sort((a, b) => {
    // Sort by paid status first (unpaid first), then by due date
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const businessPayments = sortedPayments.filter(p => p.profileType === 'business');
  const personalPayments = sortedPayments.filter(p => p.profileType !== 'business');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateBack}
              className="p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-light-text dark:text-dark-text" />
            </motion.button>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Payment Tracker</h2>
          </div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Track your monthly bills and due dates - {paymentPlan.name}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-xl font-medium hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment</span>
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Total Amount</h3>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{summary.totalAmount.toLocaleString()} LEI</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Paid</h3>
            <CheckCircle2 className="w-5 h-5 text-lime-accent" />
          </div>
          <p className="text-2xl font-bold text-lime-accent">{summary.paidAmount.toLocaleString()} LEI</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Remaining</h3>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400">{summary.remainingAmount.toLocaleString()} LEI</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Progress</h3>
            <div className="text-purple-400 text-sm font-bold">
              {summary.paidCount}/{summary.totalCount}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-light-glass dark:bg-dark-glass rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-2 bg-purple-400 rounded-full"
              />
            </div>
            <span className="text-sm font-bold text-purple-400">
              {Math.round(summary.completionPercentage)}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Add Payment Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">Add New Payment</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Profile Type</label>
              <select
                value={selectedProfileType}
                onChange={e => setSelectedProfileType(e.target.value as 'business' | 'personal')}
                className="w-full p-2 border rounded-lg mb-4 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Payment Name</label>
                <input
                  type="text"
                  value={newPayment.name || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                  placeholder="e.g., Rent, Gas Bill"
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Amount</label>
                <div className="relative">
                  <LeiIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="number"
                    value={newPayment.amount || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg pl-10 pr-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Due Date</label>
                <input
                  type="date"
                  value={newPayment.dueDate || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Category</label>
                <select
                  value={newPayment.category || 'fixed'}
                  onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value as 'fixed' | 'variable' })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                >
                  <option value="fixed">Fixed</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Notes (Optional)</label>
                <input
                  type="text"
                  value={newPayment.notes || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text hover:border-red-400/30 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddPayment}
                disabled={!newPayment.name || !newPayment.amount || !newPayment.dueDate}
                className="px-4 py-2 bg-lime-accent text-light-base dark:text-dark-base rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Payment
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">
          Payment Schedule ({sortedPayments.length} items)
        </h3>
        
        {sortedPayments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              No payments added yet. Click "Add Payment" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-bold mb-2">Business Payments</h4>
              {businessPayments.length === 0 ? <p className="text-sm text-light-text-secondary">No business payments.</p> : businessPayments.map((payment, index) => {
                const status = getDueDateStatus(payment.dueDate, payment.isPaid);
                const daysUntil = getDaysUntilDue(payment.dueDate);
                
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all ${
                      payment.isPaid
                        ? 'bg-lime-accent/5 border-lime-accent/20'
                        : status === 'overdue'
                        ? 'bg-red-500/5 border-red-500/20'
                        : status === 'urgent'
                        ? 'bg-orange-500/5 border-orange-500/20'
                        : status === 'soon'
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleTogglePaid(payment.id)}
                          className={`p-2 rounded-full transition-colors ${
                            payment.isPaid
                              ? 'bg-lime-accent text-light-base dark:text-dark-base'
                              : 'bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border hover:border-lime-accent/30'
                          }`}
                        >
                          {payment.isPaid ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </motion.button>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h5 className={`font-semibold ${
                              payment.isPaid 
                                ? 'text-light-text-secondary dark:text-dark-text-secondary line-through' 
                                : 'text-light-text dark:text-dark-text'
                            }`}>
                              {payment.name}
                            </h5>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              payment.category === 'fixed' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {payment.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`font-bold ${
                              payment.isPaid 
                                ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                                : 'text-lime-accent'
                            }`}>
                              {payment.amount.toLocaleString()} LEI
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                              <span className={`${
                                payment.isPaid 
                                  ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                                  : status === 'overdue'
                                  ? 'text-red-400'
                                  : status === 'urgent'
                                  ? 'text-orange-400'
                                  : status === 'soon'
                                  ? 'text-yellow-400'
                                  : 'text-light-text-secondary dark:text-dark-text-secondary'
                              }`}>
                                {formatDate(payment.dueDate)}
                                {!payment.isPaid && (
                                  <span className="ml-1">
                                    {daysUntil < 0 
                                      ? `(${Math.abs(daysUntil)} days overdue)` 
                                      : daysUntil === 0 
                                      ? '(Due today)' 
                                      : `(${daysUntil} days)`
                                    }
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            {!payment.isPaid && status === 'overdue' && (
                              <div className="flex items-center space-x-1 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">OVERDUE</span>
                              </div>
                            )}
                          </div>
                          
                          {payment.notes && (
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Personal Payments</h4>
              {personalPayments.length === 0 ? <p className="text-sm text-light-text-secondary">No personal payments.</p> : personalPayments.map((payment, index) => {
                const status = getDueDateStatus(payment.dueDate, payment.isPaid);
                const daysUntil = getDaysUntilDue(payment.dueDate);
                
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all ${
                      payment.isPaid
                        ? 'bg-lime-accent/5 border-lime-accent/20'
                        : status === 'overdue'
                        ? 'bg-red-500/5 border-red-500/20'
                        : status === 'urgent'
                        ? 'bg-orange-500/5 border-orange-500/20'
                        : status === 'soon'
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleTogglePaid(payment.id)}
                          className={`p-2 rounded-full transition-colors ${
                            payment.isPaid
                              ? 'bg-lime-accent text-light-base dark:text-dark-base'
                              : 'bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border hover:border-lime-accent/30'
                          }`}
                        >
                          {payment.isPaid ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </motion.button>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h5 className={`font-semibold ${
                              payment.isPaid 
                                ? 'text-light-text-secondary dark:text-dark-text-secondary line-through' 
                                : 'text-light-text dark:text-dark-text'
                            }`}>
                              {payment.name}
                            </h5>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              payment.category === 'fixed' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {payment.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`font-bold ${
                              payment.isPaid 
                                ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                                : 'text-lime-accent'
                            }`}>
                              {payment.amount.toLocaleString()} LEI
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                              <span className={`${
                                payment.isPaid 
                                  ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                                  : status === 'overdue'
                                  ? 'text-red-400'
                                  : status === 'urgent'
                                  ? 'text-orange-400'
                                  : status === 'soon'
                                  ? 'text-yellow-400'
                                  : 'text-light-text-secondary dark:text-dark-text-secondary'
                              }`}>
                                {formatDate(payment.dueDate)}
                                {!payment.isPaid && (
                                  <span className="ml-1">
                                    {daysUntil < 0 
                                      ? `(${Math.abs(daysUntil)} days overdue)` 
                                      : daysUntil === 0 
                                      ? '(Due today)' 
                                      : `(${daysUntil} days)`
                                    }
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            {!payment.isPaid && status === 'overdue' && (
                              <div className="flex items-center space-x-1 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">OVERDUE</span>
                              </div>
                            )}
                          </div>
                          
                          {payment.notes && (
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};