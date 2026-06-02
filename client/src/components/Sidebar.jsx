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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SIDEBAR_WIDTH } from '../constants/layout';
import useRenderCounter from '../hooks/useRenderCounter';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  useRenderCounter('Sidebar');

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="
          fixed left-0 top-0 z-50 h-full
          bg-[rgba(255,255,255,0.06)]
          border-r border-white/10
          backdrop-blur-md
          shadow-2xl shadow-black/40
          text-white
          transform transition-transform duration-300 ease-out
        "
        style={{
          width: SIDEBAR_WIDTH,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
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
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-400">
                  <Sparkles size={18} className="text-white" />
                </div>

                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Irshad & Co
                  </h1>
                  <p className="text-xs text-white/60">
                    Company Overview
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-white/70"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto border-t border-white/10 pt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-3 border-t border-white/10 pt-6">

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-semibold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user?.full_name}
                </p>
                <p className="truncate text-xs text-white/50">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10"
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