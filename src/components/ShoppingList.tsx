import React, { useEffect, useState } from 'react';
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
  { color: '#a3e635', label: 'To Buy' },
  { color: '#fbbf24', label: 'In Cart' },
  { color: '#22d3ee', label: 'Not Found' },
  { color: '#10b981', label: 'Bought' },
];

export const ShoppingListComponent: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState<ShoppingItem>(defaultItem());
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">🛒 Shopping Lists</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="border rounded-lg p-2 flex-1"
          placeholder="New list name..."
          value={newListName}
          onChange={e => setNewListName(e.target.value)}
        />
        <button
          className="bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600"
          onClick={handleCreateList}
          disabled={isLoading || !newListName.trim()}
        >
          + Create
        </button>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
          <h3 className="font-semibold mb-2">Your Lists</h3>
          <ul>
            {lists.map(list => (
              <li
                key={list.id}
                className={`p-2 rounded-xl mb-3 cursor-pointer transition-colors duration-200 flex items-center gap-2 border-2 ${activeList?.id === list.id ? 'bg-lime-200/80 dark:bg-lime-700/80 border-lime-400 dark:border-lime-500 shadow-lg' : 'bg-white/10 dark:bg-gray-900/60 border-transparent hover:bg-gray-100/60 dark:hover:bg-gray-800/80'}`}
                onClick={() => setActiveList(list)}
                style={{ minHeight: 48 }}
              >
                <span className="font-semibold text-lg text-gray-900 dark:text-white flex-1 truncate">{list.name}</span>
                <button
                  className="text-xs text-red-500 hover:underline px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={e => { e.stopPropagation(); handleDeleteList(list.id); }}
                >Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3">
          {activeList ? (
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h4 className="text-xl font-bold flex-1 text-gray-900 dark:text-white">{activeList.name}</h4>
                <button
                  className="text-xs text-blue-600 hover:underline mr-2 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={handleReuseList}
                  disabled={isLoading}
                >Reuse</button>
              </div>
              <ul className="mb-4">
                {activeList.items.map(item => (
                  <li key={item.id} className="flex items-center mb-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheckItem(item.id)}
                      className="mr-2 accent-lime-500"
                    />
                    <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{item.name} {item.quantity ? <span className="text-xs text-gray-500">x{item.quantity}</span> : null}</span>
                    <div className="flex gap-1 mr-2">
                      {statusColors.map(sc => (
                        <button
                          key={sc.color}
                          className="w-4 h-4 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-lime-400"
                          style={{ background: item.statusColor === sc.color ? sc.color : 'transparent', borderColor: sc.color }}
                          title={sc.label}
                          onClick={() => handleChangeItemColor(item.id, sc.color)}
                        />
                      ))}
                    </div>
                    <button
                      className="text-xs text-red-500 hover:underline px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => handleDeleteItem(item.id)}
                    >Delete</button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="border rounded-lg p-2 flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="Item name..."
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                  type="number"
                  className="border rounded-lg p-2 w-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="Qty"
                  value={newItem.quantity || 1}
                  min={1}
                  onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                />
                <button
                  className="bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-400 font-semibold"
                  onClick={handleAddItem}
                  disabled={!newItem.name.trim()}
                >
                  + Add
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select or create a shopping list to get started.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingListComponent; 