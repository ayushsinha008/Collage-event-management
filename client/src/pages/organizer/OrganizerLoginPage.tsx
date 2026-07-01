import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizerContext } from '../../context/OrganizerContext';
import { Zap } from 'lucide-react';

export const OrganizerLoginPage: React.FC = () => {
  const { login } = useOrganizerContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/organizer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 pattern-grid opacity-30 pointer-events-none"></div>
      
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary-fixed border-4 border-on-background neo-shadow -rotate-12 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary-fixed border-4 border-on-background neo-shadow rounded-full rotate-45 pointer-events-none hidden md:block"></div>

      <div className="w-full max-w-md bg-surface border-4 border-on-background p-10 neo-shadow relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10 border-b-4 border-on-background pb-6">
          <div className="bg-primary-fixed p-2 border-4 border-on-background shadow-[4px_4px_0_0_#000] rotate-[-10deg]">
            <Zap className="w-8 h-8 stroke-[3]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase">FestFlow<span className="text-primary tracking-normal ml-2">ORG</span></h1>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-extrabold uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm uppercase focus:outline-none focus:neo-shadow-sm transition-shadow"
              placeholder="YOU@EXAMPLE.COM"
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm uppercase focus:outline-none focus:neo-shadow-sm transition-shadow"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-error-container border-4 border-on-background p-3 flex items-center justify-center">
              <p className="text-sm font-label-bold text-on-error-container uppercase tracking-wide">{error}</p>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full flex items-center justify-center bg-tertiary-fixed hover:bg-tertiary text-on-tertiary-fixed font-extrabold text-lg py-4 border-4 border-on-background neo-shadow-sm hover-lift uppercase transition-all disabled:opacity-50 mt-8"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
};