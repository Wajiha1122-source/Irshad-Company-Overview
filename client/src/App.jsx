import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Inventory from './pages/Inventory';
import Assets from './pages/Assets';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import { SIDEBAR_WIDTH } from './constants/layout';

const queryClient = new QueryClient();

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen text-white overflow-hidden">

      {/* 🌌 ANIMATED LOGIN-STYLE BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Base gradient (same as login) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.25),transparent_35rem),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.25),transparent_40rem),linear-gradient(135deg,#08111f,#0f172a)]" />

        {/* Floating blob 1 */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-teal-500/30 blur-[100px] animate-[float_14s_ease-in-out_infinite] top-[-120px] left-[-120px]" />

        {/* Floating blob 2 */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/30 blur-[110px] animate-[floatReverse_18s_ease-in-out_infinite] bottom-[-150px] right-[-120px]" />

        {/* Floating blob 3 */}
        <div className="absolute w-[380px] h-[380px] rounded-full bg-indigo-500/20 blur-[120px] animate-[float_20s_ease-in-out_infinite] top-[40%] left-[55%]" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main area */}
      <div
        className="relative z-10 flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/assets" element={<Assets />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/reports" element={<Reports />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;