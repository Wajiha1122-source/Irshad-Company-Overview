import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AssetForm from '../components/AssetForm';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Laptop,
  User,
  Calendar,
  Building
} from 'lucide-react';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const { isDark } = useTheme();

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await api.delete(`/assets/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error deleting asset. Please try again.');
      }
    }
  };

  const statusClasses = {
    Available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    Assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    'Under Repair': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    Lost: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  };

  useEffect(() => {
    fetchData();
  }, [selectedOffice, selectedStatus]);

  const fetchData = async () => {
    try {
      const [assetsRes, officesRes] = await Promise.all([
        api.get('/assets', { params: { office_id: selectedOffice, status: selectedStatus } }),
        api.get('/offices')
      ]);
      setAssets(assetsRes.data.assignments || assetsRes.data.data || []);
      setOffices(officesRes.data.offices || officesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAssets([]);
      setOffices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const statuses = ['Available', 'Assigned', 'Under Repair', 'Lost'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="page-heading">
            Asset Assignments
          </h1>
          <p className="page-subtitle">
            Track and manage company assets
          </p>
        </div>
        <button
          onClick={handleAddAsset}
          className="primary-button w-full sm:w-auto"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStatus('')}
          className={`
            chip
            ${!selectedStatus
              ? '!border-transparent !bg-gradient-to-r !from-blue-600 !to-teal-500 !text-white shadow-lg shadow-blue-600/20'
              : ''
            }
          `}
        >
          All Status
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`
              chip
              ${selectedStatus === status
                ? '!border-transparent !bg-gradient-to-r !from-blue-600 !to-teal-500 !text-white shadow-lg shadow-blue-600/20'
                : ''
              }
            `}
          >
            {status}
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
              placeholder="Search assets..."
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

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <GlassCard key={asset.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-3 shadow-md shadow-blue-600/20">
                <Laptop size={20} className="text-white" />
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusClasses[asset.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                {asset.status}
              </span>
            </div>

            <h3 className="mb-2 truncate font-semibold text-slate-950 dark:text-white">{asset.asset_name}</h3>
            <p className={`mb-4 truncate font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {asset.asset_code}
            </p>

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex items-center gap-3">
                <Building size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{asset.office_name}</span>
              </div>
              {asset.employee_name && (
                <div className="flex items-center gap-3">
                  <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{asset.employee_name}</span>
                </div>
              )}
              {asset.assignment_date && (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Assigned: {new Date(asset.assignment_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {asset.notes && (
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {asset.notes}
              </p>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleEditAsset(asset)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                <Edit size={14} />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteAsset(asset.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-16">
          <Laptop size={48} className={isDark ? 'text-gray-600 mx-auto' : 'text-gray-400 mx-auto'} />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No assets found
          </p>
        </div>
      )}

      <AssetForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        asset={editingAsset}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Assets;
