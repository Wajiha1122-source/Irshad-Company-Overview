import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.25),transparent_35rem),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.25),transparent_40rem),linear-gradient(135deg,#08111f,#0f172a)]" />

      </div>

      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* MAIN */}
      <div
        className="relative z-10 flex min-h-screen flex-1 flex-col lg:ml-[300px]"
      >
        <Header
          key={`${location.pathname}${location.search}`}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
