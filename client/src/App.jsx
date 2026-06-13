import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './Layout'; // 👈 IMPORTANT: move Layout to separate file OR keep below (recommended)

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Inventory from './pages/Inventory';
import Assets from './pages/Assets';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import SearchResults from './pages/SearchResults';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>

              {/* PUBLIC */}
              <Route path="/login" element={<Login />} />

              {/* PROTECTED WRAPPER */}
              <Route element={<ProtectedRoute />}>
                
                {/* LAYOUT WRAPPER */}
                <Route element={<Layout />}>

                  <Route index element={<Navigate to="/dashboard" replace />} />

                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="assets" element={<Assets />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="search" element={<SearchResults />} />

                </Route>

              </Route>

            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
