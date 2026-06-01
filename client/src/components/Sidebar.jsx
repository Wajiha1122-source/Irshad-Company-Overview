import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Laptop, 
  BarChart3, 
  FileText, 
  LogOut,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SIDEBAR_WIDTH } from '../constants/layout';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/assets', icon: Laptop, label: 'Asset Assignments' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-0 z-50 h-full border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transform transition-transform duration-300 ease-out"
        style={{ width: SIDEBAR_WIDTH, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <style>{`
          @media (min-width: 1024px) {
            aside {
              transform: translateX(0) !important;
            }
          }
        `}</style>
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="pb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 dark:bg-white">
                  <Sparkles size={18} className="text-white dark:text-slate-950" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-slate-950 dark:text-white">
                    Irshad & Co
                  </h1>
                  <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">Company Overview</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 lg:hidden"
                aria-label="Close menu"
              >
                <X size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto border-t border-slate-200 pt-6 dark:border-slate-800">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group relative flex h-12 items-center gap-3 rounded-xl px-4
                    text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }
                  `}
                >
                  <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-2 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user?.full_name}</p>
                <p className="truncate text-xs text-slate-500">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium
                text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={logout}
              className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
