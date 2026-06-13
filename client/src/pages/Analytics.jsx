import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Users, Package, TrendingUp } from 'lucide-react';

const COLORS = ['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b', '#e11d48', '#0ea5e9'];

const Analytics = () => {
  const [employeeStats, setEmployeeStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  const fetchAnalytics = async () => {
    try {
      const [employeeRes, inventoryRes] = await Promise.all([
        api.get('/analytics/employees'),
        api.get('/analytics/inventory')
      ]);
      console.log('Employee stats:', employeeRes.data);
      console.log('Inventory stats:', inventoryRes.data);
      setEmployeeStats(employeeRes.data);
      setInventoryStats(inventoryRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchAnalytics, 0);
    return () => window.clearTimeout(timer);
  }, []);

 if (loading) {
  return <SkeletonLoader />;
}

  const employeesByOffice = (employeeStats?.by_office || [])
    .map((office) => ({
      name: office.office_name || 'Unknown office',
      count: Number(office.count || 0),
    }))
    .filter((office) => office.count > 0);

  const employeesByAuthority = (employeeStats?.by_authority || []).map((item) => ({
    ...item,
    count: Number(item.count || 0),
  }));

  const inventoryByType = (inventoryStats?.by_type || []).map((item) => ({
    ...item,
    total: Number(item.total || 0),
  }));

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h1 className="page-heading">Analytics</h1>
        <p className="page-subtitle">
          Company insights and statistics
        </p>
      </div>

      {/* Employee Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-blue-500/10 p-2.5">
              <Users className="text-blue-500" size={24} />
            </div>
            <h2 className="text-xl font-semibold">Employees by Office</h2>
          </div>
          {employeesByOffice.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employeesByOffice}
                  cx="50%"
                  cy="50%"
                  label={false}
                  outerRadius={82}
                  dataKey="count"
                  nameKey="name"
                >
                  {employeesByOffice.map((office, index) => (
                    <Cell key={office.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-200">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
              No employee office data available
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-violet-500/10 p-2.5">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
            <h2 className="text-xl font-semibold">Employees by Authority</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeesByAuthority}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="authority_level" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '#374151' : '#e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-emerald-500/10 p-2.5">
              <Package className="text-green-500" size={24} />
            </div>
            <h2 className="text-xl font-semibold">Inventory by Type</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryByType}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="type" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '#374151' : '#e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-amber-500/10 p-2.5">
              <TrendingUp className="text-orange-500" size={24} />
            </div>
            <h2 className="text-xl font-semibold">Top Items by Quantity</h2>
          </div>
          <div className="space-y-3">
            {inventoryStats?.top_items?.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between rounded-2xl border p-3 transition-all hover:-translate-y-0.5
                  ${isDark ? 'border-slate-800 bg-slate-950/35' : 'border-white bg-white/64'}
                `}
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.type} - {item.office_name}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{item.quantity}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Low Stock Alerts */}
      {inventoryStats?.low_stock && inventoryStats.low_stock.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-rose-500/10 p-2.5">
              <TrendingUp className="text-red-500" size={24} />
            </div>
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryStats.low_stock.map((item, index) => (
              <div
                key={index}
                className={`
                  rounded-2xl border p-4 transition-all hover:-translate-y-1
                  ${isDark ? 'border-rose-900/70 bg-rose-950/20' : 'border-rose-200 bg-rose-50/80'}
                `}
              >
                <p className="font-semibold mb-1">{item.name}</p>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.type} - {item.office_name}
                </p>
                <p className="text-2xl font-bold text-red-600">{item.quantity} left</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Analytics;
