import { useState } from 'react';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(location.search).get('q') || ''
  );

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/employees': 'Employees',
    '/inventory': 'Inventory',
    '/assets': 'Asset Assignments',
    '/analytics': 'Analytics',
    '/reports': 'Reports',
    '/search': 'Search',
  };
  const title = pageTitles[location.pathname] || 'Dashboard';

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (location.pathname === '/search') navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-800 bg-slate-950">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="truncate text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[32px]">{title}</h1>
        </div>
          
        <div className="hidden flex-1 justify-center md:flex">
          <form onSubmit={handleSearch} className="relative w-[400px] max-w-full" role="search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employees, inventory, assets..."
              aria-label="Search company records"
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-20 text-sm text-white placeholder-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-10 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 hover:text-white"
              aria-label="Run search"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        <div className="flex min-w-0 items-center gap-4">
          <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className="flex min-w-0 items-center gap-3 border-l border-slate-800 pl-3 sm:gap-4 sm:pl-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-semibold text-white ring-1 ring-slate-700">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="truncate text-xs text-slate-300">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
