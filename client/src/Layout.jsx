import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { SIDEBAR_WIDTH } from './constants/layout';

import useRenderCounter from './hooks/useRenderCounter';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useRenderCounter('Layout');
  console.log('[Layout] Rendered');

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {}, 100);
    };

    const mainElement = document.querySelector('main');

    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (mainElement) mainElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.25),transparent_35rem),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.25),transparent_40rem),linear-gradient(135deg,#08111f,#0f172a)]" />

        <div className="absolute w-[420px] h-[420px] rounded-full bg-teal-500/30 blur-[30px] top-[-120px] left-[-120px]" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/30 blur-[30px] bottom-[-150px] right-[-120px]" />
        <div className="absolute w-[380px] h-[380px] rounded-full bg-indigo-500/20 blur-[30px] top-[40%] left-[55%]" />
      </div>

      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* MAIN */}
      <div
        className="relative z-10 flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}