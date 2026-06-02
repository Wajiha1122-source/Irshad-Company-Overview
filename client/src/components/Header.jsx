import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useRenderCounter from '../hooks/useRenderCounter';

const Header = ({ onMenuClick }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  useRenderCounter('Header');

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/employees': 'Employees',
    '/inventory': 'Inventory',
    '/assets': 'Asset Assignments',
    '/analytics': 'Analytics',
    '/reports': 'Reports',
  };
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className={`
      sticky top-0 z-30 h-[72px] border-b
      ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}
    `}>
      <div className="flex h-full items-center justify-between gap-8 px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="truncate text-[32px] font-bold leading-tight text-slate-950 dark:text-white">{title}</h1>
        </div>
          
        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-[400px] max-w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search records, reports, assets..."
              className={`
                h-11 w-full rounded-xl py-2.5 pl-11 pr-4 text-sm shadow-sm
                ${isDark 
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }
                border focus:outline-none focus:ring-4 focus:ring-slate-900/10
              `}
            />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-4">
          <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className={`flex min-w-0 items-center gap-4 border-l pl-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-slate-900 dark:text-white">{user?.full_name}</p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
