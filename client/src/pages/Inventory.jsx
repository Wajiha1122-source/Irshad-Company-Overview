import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import InventoryForm from '../components/InventoryForm';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import useRenderCounter from '../hooks/useRenderCounter';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Package
} from 'lucide-react';

const Inventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [offices, setOffices] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchTerm = searchParams.get('q') || '';
  const [selectedOffice, setSelectedOffice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { isDark } = useTheme();
  const selectedType = searchParams.get('type') || '';
  useRenderCounter('Inventory');

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (value.trim()) nextParams.set('q', value);
      else nextParams.delete('q');
      return nextParams;
    }, { replace: true });
  };

  const handleTypeChange = useCallback((type) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (type) {
        nextParams.set('type', type);
      } else {
        nextParams.delete('type');
      }

      return nextParams;
    });
  }, [setSearchParams]);

  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setShowModal(true);
  }, []);

  const handleEditItem = useCallback((item) => {
    setEditingItem(item);
    setShowModal(true);
  }, []);

  const handleDeleteItem = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/items/${id}`);
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      }
    }
  }, []);

  const typeClasses = {
    Stationary: 'bg-blue-950/60 text-blue-300 ring-1 ring-blue-800',
    Devices: 'bg-violet-950/60 text-violet-300 ring-1 ring-violet-800',
    Appliances: 'bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-800',
    Furniture: 'bg-amber-950/60 text-amber-300 ring-1 ring-amber-800',
    Cleaning: 'bg-rose-950/60 text-rose-300 ring-1 ring-rose-800',
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, officesRes, totalsRes] = await Promise.all([
        api.get('/inventory/items', { params: { type: selectedType, office_id: selectedOffice } }).catch(() => ({ data: { items: [] } })),
        api.get('/offices').catch(() => ({ data: { offices: [] } })),
        api.get('/inventory/totals', { params: { type: selectedType, office_id: selectedOffice } }).catch(() => ({ data: null }))
      ]);
      setItems(itemsRes.data.items || []);
      setOffices(officesRes.data.offices || officesRes.data.data || []);
      setTotals(totalsRes.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setItems([]);
      setOffices([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedOffice]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const filteredItems = useMemo(() => items.filter(item => {
    if (!item) return false;
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [
      item.name,
      item.category_name,
      item.category_type,
      item.office_name,
      item.notes,
      item.quantity,
    ].some((value) => String(value ?? '').toLowerCase().includes(query));
  }), [items, searchTerm]);

 if (loading) {
  return <SkeletonLoader />;
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
          onClick={() => handleTypeChange('')}
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
            onClick={() => handleTypeChange(type)}
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
              onChange={handleSearchChange}
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

      {/* Simple Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Item Name</th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Category</th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Office</th>
                <th className={`text-center py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Quantity</th>
                <th className={`text-center py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Notes</th>
                <th className={`text-center py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</td>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.category_name}</td>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.office_name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                  </td>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.notes || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-950/30"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <Package size={48} className={isDark ? 'text-gray-600 mx-auto' : 'text-gray-400 mx-auto'} />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchTerm ? `No inventory items match "${searchTerm}"` : 'No inventory items found'}
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
