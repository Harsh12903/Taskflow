import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiFlashlightLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-2xl shadow-brand-600/40 mb-4">
            <RiFlashlightLine size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-800 text-white">Welcome back</h1>
          <p className="text-white/40 mt-2 text-sm">Sign in to continue to TaskFlow</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
            <p className="text-xs text-brand-300 text-center">
              <strong>Hey!</strong> Create an account to get started
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
