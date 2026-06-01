import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import InventoryForm from '../components/InventoryForm';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [offices, setOffices] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { isDark } = useTheme();

  const handleAddItem = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/items/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      }
    }
  };

  const typeClasses = {
    Stationary: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    Devices: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30',
    Appliances: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    Furniture: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    Cleaning: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
  };

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedOffice]);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes, officesRes, totalsRes] = await Promise.all([
        api.get('/inventory/items', { params: { type: selectedType, office_id: selectedOffice } }),
        api.get('/inventory/categories'),
        api.get('/offices'),
        api.get('/inventory/totals', { params: { type: selectedType, office_id: selectedOffice } })
      ]);
      setItems(itemsRes.data.items);
      setOffices(officesRes.data.offices);
      setTotals(totalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const types = ['Stationary', 'Devices', 'Appliances', 'Furniture', 'Cleaning'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="page-heading">
            Inventory
          </h1>
          <p className="page-subtitle">
            Manage company inventory
          </p>
        </div>
        <button
          onClick={handleAddItem}
          className="primary-button w-full sm:w-auto"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('')}
          className={`
            chip
            ${!selectedType
              ? '!border-transparent !bg-gradient-to-r !from-blue-600 !to-teal-500 !text-white shadow-lg shadow-blue-600/20'
              : ''
            }
          `}
        >
          All Types
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              chip
              ${selectedType === type
                ? '!border-transparent !bg-gradient-to-r !from-blue-600 !to-teal-500 !text-white shadow-lg shadow-blue-600/20'
                : ''
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Filters */}
      <GlassCard className="mb-6" hover={false}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                field pl-11
              `}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className={`
                field pl-11 pr-8 md:w-56
              `}
            >
              <option value="">All Offices</option>
              {offices.map(office => (
                <option key={office.id} value={office.id}>{office.name}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Totals Summary */}
      {totals?.grand_totals && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {totals.grand_totals.map((total) => (
            <GlassCard key={total.type} className="text-center">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${typeClasses[total.type] || typeClasses.Stationary}`}>
                <Package size={24} />
              </div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{total.type}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total.total}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <GlassCard key={item.id} hover>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-3 shadow-md shadow-blue-600/20">
                <Package size={20} className="text-white" />
              </div>
              <span className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                ${item.quantity > 10 
                  ? 'bg-green-100 text-green-700' 
                  : item.quantity > 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }
              `}>
                {item.quantity > 10 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>

            <h3 className="mb-2 truncate font-semibold text-slate-950 dark:text-white">{item.name}</h3>
            <p className={`mb-4 truncate text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {item.category_name}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {item.quantity > 0 ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className="text-xl font-bold text-gray-900 dark:text-white">{item.quantity}</span>
              </div>
              <span className={`truncate text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {item.office_name}
              </span>
            </div>

            {item.notes && (
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {item.notes}
              </p>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleEditItem(item)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                <Edit size={14} />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <Package size={48} className={isDark ? 'text-gray-600 mx-auto' : 'text-gray-400 mx-auto'} />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No inventory items found
          </p>
        </div>
      )}

      <InventoryForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={editingItem}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Inventory;
