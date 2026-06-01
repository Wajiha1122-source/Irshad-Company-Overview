import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Building2, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Connection timeout. Please check if the backend server is running.');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.32),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(37,99,235,0.34),transparent_34rem),linear-gradient(135deg,#08111f,#0f172a)]" />
      <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.08] shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="hidden min-h-[620px] flex-col justify-between border-r border-white/10 p-8 text-white lg:flex">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-teal-100">
              Modern Office Control
            </div>
            <h1 className="max-w-md text-5xl font-semibold leading-tight tracking-tight">Irshad & Co Company Overview</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">A cleaner workspace for employees, inventory, assets, analytics, and reports.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Employees', 'Inventory', 'Assets'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-teal-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg shadow-blue-500/25">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">Welcome Back</h1>
            <p className="text-white/65">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-white placeholder-white/45 focus:outline-none focus:ring-4 focus:ring-teal-400/20"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-white placeholder-white/45 focus:outline-none focus:ring-4 focus:ring-teal-400/20"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/55">
            <p>Contact administrator for account access</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
