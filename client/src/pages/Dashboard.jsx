import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  Users, 
  Package, 
  Laptop, 
  Armchair, 
  Fan, 
  Brush,
  FileText,
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Employees',
      value: stats?.employees || 0,
      icon: Users,
      color: 'blue',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Stationary',
      value: stats?.inventory?.find(i => i.type === 'Stationary')?.total || 0,
      icon: Package,
      color: 'purple',
      onClick: () => navigate('/inventory?type=Stationary'),
    },
    {
      title: 'Devices',
      value: stats?.inventory?.find(i => i.type === 'Devices')?.total || 0,
      icon: Laptop,
      color: 'green',
      onClick: () => navigate('/inventory?type=Devices'),
    },
    {
      title: 'Appliances',
      value: stats?.inventory?.find(i => i.type === 'Appliances')?.total || 0,
      icon: Fan,
      color: 'orange',
      onClick: () => navigate('/inventory?type=Appliances'),
    },
    {
      title: 'Furniture',
      value: stats?.inventory?.find(i => i.type === 'Furniture')?.total || 0,
      icon: Armchair,
      color: 'pink',
      onClick: () => navigate('/inventory?type=Furniture'),
    },
    {
      title: 'Cleaning',
      value: stats?.inventory?.find(i => i.type === 'Cleaning')?.total || 0,
      icon: Brush,
      color: 'red',
      onClick: () => navigate('/inventory?type=Cleaning'),
    },
    {
      title: 'Asset Assignments',
      value: stats?.assets?.reduce((sum, a) => sum + parseInt(a.count), 0) || 0,
      icon: Laptop,
      color: 'purple',
      onClick: () => navigate('/assets'),
    },
    {
      title: 'Reports',
      value: 'View',
      icon: FileText,
      color: 'blue',
      onClick: () => navigate('/reports'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
<div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-8 dark:shadow-black/40">       
<h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">          Dashboard
        </h1>
<p className="page-subtitle">
            Welcome to Irshad & Company Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Office Overview */}
      {stats?.offices && stats.offices.length > 0 && (
        <GlassCard>
          <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">
            Office Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.offices.map((office) => (
              <div
                key={office.id}
                className={`
                  rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
${isDark
  ? 'bg-white/[0.06] border border-white/10 backdrop-blur-xl'
  : 'bg-white/80 border border-white/60 backdrop-blur-xl'
}
                `}
              >
                <h3 className="mb-4 truncate font-semibold text-slate-950 dark:text-white">{office.name}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Employees:</span>
                    <span className="font-medium">{office.employee_count}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Inventory Items:</span>
                    <span className="font-medium">{office.inventory_count}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Assets:</span>
                    <span className="font-medium">{office.asset_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Dashboard;
