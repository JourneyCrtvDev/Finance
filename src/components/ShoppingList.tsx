import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Trash2, Check, Edit3, ArrowLeft, Calendar } from 'lucide-react';
import { ShoppingList, ShoppingItem } from '../types/shopping';
import { ShoppingListService } from '../services/shoppingListService';
import { getCurrentUser } from '../lib/supabaseClient';

const defaultItem = (): ShoppingItem => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: 1,
  checked: false,
  category: '',
  notes: '',
  statusColor: '#a3e635', // lime accent
});

const statusColors = [
  { color: '#a3e635', label: 'To Buy', bgClass: 'bg-lime-500' },
  { color: '#fbbf24', label: 'In Cart', bgClass: 'bg-amber-500' },
  { color: '#22d3ee', label: 'Not Found', bgClass: 'bg-cyan-500' },
  { color: '#10b981', label: 'Bought', bgClass: 'bg-emerald-500' },
];

export const ShoppingListComponent: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState<ShoppingItem>(defaultItem());
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        setUserId(user.id);
        loadLists(user.id);
      }
    });
  }, []);

  const loadLists = async (uid: string) => {
    setIsLoading(true);
    try {
      const data = await ShoppingListService.getLists(uid);
      setLists(data);
      setActiveList(data[0] || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!userId || !newListName.trim()) return;
    setIsLoading(true);
    try {
      const created = await ShoppingListService.createList(userId, newListName, []);
      if (created) {
        setLists([created, ...lists]);
        setActiveList(created);
        setNewListName('');
        setShowCreateForm(false);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!activeList || !newItem.name.trim()) return;
    const updatedItems = [...activeList.items, { ...newItem, id: crypto.randomUUID() }];
    await handleUpdateList(updatedItems);
    setNewItem(defaultItem());
  };

  const handleUpdateList = async (items: ShoppingItem[]) => {
    if (!activeList) return;
    setIsLoading(true);
    try {
      const updated = await ShoppingListService.updateList(activeList.id, items);
      if (updated) {
        setActiveList(updated);
        setLists(lists.map(l => (l.id === updated.id ? updated : l)));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckItem = (itemId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    handleUpdateList(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.filter(item => item.id !== itemId);
    handleUpdateList(updatedItems);
  };

  const handleChangeItemColor = (itemId: string, color: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.map(item =>
      item.id === itemId ? { ...item, statusColor: color } : item
    );
    handleUpdateList(updatedItems);
  };

  const handleDeleteList = async (listId: string) => {
    setIsLoading(true);
    try {
      await ShoppingListService.deleteList(listId);
      setLists(lists.filter(l => l.id !== listId));
      setActiveList(lists.length > 1 ? lists.find(l => l.id !== listId) || null : null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReuseList = async () => {
    if (!userId || !activeList) return;
    setIsLoading(true);
    try {
      const reused = await ShoppingListService.reuseList(userId, activeList);
      if (reused) {
        setLists([reused, ...lists]);
        setActiveList(reused);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && lists.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading shopping lists...</p>
        </motion.div>
      </div>
    );
  }

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
            <div className="p-2 bg-lime-accent/20 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-lime-accent" />
            </div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Shopping Lists</h2>
          </div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Organize your shopping with smart lists and status tracking
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-xl font-medium hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New List</span>
        </motion.button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Create List Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">Create New Shopping List</h3>
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                placeholder="Enter list name..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateList()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateList}
                disabled={isLoading || !newListName.trim()}
                className="bg-lime-accent text-light-base dark:text-dark-base px-6 py-2 rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text hover:border-red-400/30 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
        >
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-4">
            Your Lists ({lists.length})
          </h3>
          
          {lists.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                No shopping lists yet. Create your first one!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setActiveList(list)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    activeList?.id === list.id
                      ? 'bg-lime-accent/10 border-lime-accent/30 text-lime-accent'
                      : 'bg-light-glass dark:bg-dark-glass border-transparent hover:border-lime-accent/20 text-light-text dark:text-dark-text hover:text-lime-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{list.name}</h4>
                      <p className="text-xs opacity-70 mt-1">
                        {list.items.length} items • {list.items.filter(i => i.checked).length} completed
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id);
                      }}
                      className="p-1 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Active List Content */}
        <div className="lg:col-span-2">
          {activeList ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
            >
              {/* List Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial">{activeList.name}</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    {activeList.items.filter(i => i.checked).length} of {activeList.items.length} items completed
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReuseList}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reuse</span>
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Progress</span>
                  <span className="text-lime-accent font-medium">
                    {Math.round((activeList.items.filter(i => i.checked).length / Math.max(activeList.items.length, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(activeList.items.filter(i => i.checked).length / Math.max(activeList.items.length, 1)) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-2 bg-lime-accent rounded-full"
                  />
                </div>
              </div>

              {/* Add Item Form */}
              <div className="mb-6 p-4 bg-light-glass dark:bg-dark-glass rounded-xl">
                <h4 className="font-semibold text-light-text dark:text-dark-text mb-3">Add New Item</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    className="sm:col-span-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                    placeholder="Item name..."
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    onKeyPress={e => e.key === 'Enter' && handleAddItem()}
                  />
                  <input
                    type="number"
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                    placeholder="Qty"
                    value={newItem.quantity || 1}
                    min={1}
                    onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddItem}
                    disabled={!newItem.name.trim()}
                    className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </motion.button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {activeList.items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      No items in this list yet. Add some items to get started!
                    </p>
                  </div>
                ) : (
                  activeList.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-xl border transition-all ${
                        item.checked
                          ? 'bg-lime-accent/5 border-lime-accent/20 opacity-75'
                          : 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCheckItem(item.id)}
                          className={`p-2 rounded-full transition-colors ${
                            item.checked
                              ? 'bg-lime-accent text-light-base dark:text-dark-base'
                              : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-lime-accent/30'
                          }`}
                        >
                          {item.checked && <Check className="w-4 h-4" />}
                        </motion.button>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              item.checked 
                                ? 'text-light-text-secondary dark:text-dark-text-secondary line-through' 
                                : 'text-light-text dark:text-dark-text'
                            }`}>
                              {item.name}
                            </span>
                            {item.quantity && item.quantity > 1 && (
                              <span className="text-xs bg-light-surface dark:bg-dark-surface px-2 py-1 rounded-full text-light-text-secondary dark:text-dark-text-secondary">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Colors */}
                        <div className="flex items-center space-x-1">
                          {statusColors.map(sc => (
                            <motion.button
                              key={sc.color}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-4 h-4 rounded-full border-2 transition-all ${
                                item.statusColor === sc.color 
                                  ? `${sc.bgClass} border-current` 
                                  : 'border-current opacity-30 hover:opacity-70'
                              }`}
                              style={{ borderColor: sc.color }}
                              title={sc.label}
                              onClick={() => handleChangeItemColor(item.id, sc.color)}
                            />
                          ))}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-12 shadow-glass text-center"
            >
              <ShoppingCart className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-2">
                No List Selected
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Select a shopping list from the sidebar or create a new one to get started.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="bg-lime-accent text-light-base dark:text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
              >
                Create Your First List
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingListComponent;