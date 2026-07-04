import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, GraduationCap, HeartHandshake, Lock, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { user, login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState<'student' | 'organizer' | 'volunteer'>('student');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (user.role === 'volunteer') {
        navigate('/volunteer');
      } else {
        navigate(from);
      }
    }
  }, [user, navigate, from]);

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setSuccess(`Authenticated as ${user.name}! Redirecting...`);
      setTimeout(() => navigate(from), 1000);
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const user = await login('', password, role);
      setSuccess(`Authenticated as ${user.name}! Redirecting...`);
      setTimeout(() => {
        navigate(role === 'organizer' ? '/organizer/dashboard' : '/volunteer');
      }, 1000);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Authentication failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: 'student' | 'organizer' | 'volunteer') => {
    setRole(newRole);
    setError('');
    setSuccess('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4 md:p-margin-desktop relative overflow-hidden text-on-background font-body-md">
      <div className="absolute inset-0 bg-[radial-gradient(#1b1b1b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <div className="absolute top-10 left-10 w-36 h-36 bg-[#a6f2cf] border-4 border-on-background neo-shadow -rotate-12 pointer-events-none hidden lg:block">
        <div className="p-4 font-label-bold text-xs uppercase tracking-widest text-[#002115]">
          ✦ CAMPUS HUB
        </div>
      </div>
      <div className="absolute bottom-12 right-12 w-44 h-44 bg-[#ffe24c] border-4 border-on-background neo-shadow rounded-full rotate-12 pointer-events-none hidden lg:block flex items-center justify-center">
        <div className="text-center font-headline-lg font-bold text-[#211b00]">
          JOIN<br/>THE<br/>FUN!
        </div>
      </div>

      <div className="w-full max-w-lg bg-surface border-4 border-on-background p-6 md:p-10 neo-shadow-lg relative z-10 my-8">
        <div className="text-center mb-8 border-b-4 border-on-background pb-6">
          <div className="inline-flex items-center gap-2 bg-[#a6f2cf] border-4 border-on-background px-4 py-2 neo-shadow-sm rotate-[-3deg] mb-4 hover:rotate-0 transition-transform">
            <Zap className="w-8 h-8 text-on-background fill-on-background animate-pulse" />
            <span className="text-2xl font-black tracking-tight" style={{ textShadow: '1px 1px 0 #fff' }}>FESTFLOW</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mt-2">CAMPUS PLATFORM GATEWAY</h1>
          <p className="text-xs font-label-bold text-on-surface-variant mt-1 uppercase tracking-widest">Authenticate to access events & panels</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8 bg-surface-container-high p-1.5 border-4 border-on-background neo-shadow-sm">
          {(['student', 'organizer', 'volunteer'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`py-3 px-1 md:px-3 text-xs font-black uppercase tracking-wider border-2 flex flex-col md:flex-row items-center justify-center gap-1.5 transition-all ${
                role === r
                  ? r === 'student'
                    ? 'bg-[#ffe24c] border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                    : r === 'organizer'
                    ? 'bg-[#a6f2cf] border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                    : 'bg-[#ffe5ec] border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                  : 'bg-surface border-transparent text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {r === 'student' && <GraduationCap className="w-4 h-4" />}
              {r === 'organizer' && <Zap className="w-4 h-4" />}
              {r === 'volunteer' && <HeartHandshake className="w-4 h-4" />}
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-error-container border-4 border-on-background p-4 mb-6 neo-shadow-sm text-center">
            <p className="text-sm font-label-bold text-on-error-container uppercase tracking-wide">⚠️ {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-primary-container border-4 border-on-background p-4 mb-6 neo-shadow-sm text-center">
            <p className="text-sm font-label-bold text-on-primary-container uppercase tracking-wide">✓ {success}</p>
          </div>
        )}

        {role === 'student' ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center font-black text-base py-4 border-4 border-black bg-white text-black neo-shadow hover-lift press-down uppercase transition-all disabled:opacity-50 mt-4 gap-3 cursor-pointer"
          >
            {loading ? (
              <span>VERIFYING GOOGLE ACCOUNT...</span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.76 5.76 0 0 1 8.2 12.8a5.76 5.76 0 0 1 5.79-5.8c1.498 0 2.861.57 3.905 1.5l3.185-3.185A10.22 10.22 0 0 0 14 1C7.373 1 2 6.373 2 13s5.373 12 12 12c6.9 0 10.74-4.909 10.74-11.236 0-.773-.082-1.355-.2-1.98H12.24Z"
                  />
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>
        ) : (
          <form onSubmit={handleStaffSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1.5">
                {role === 'organizer' ? 'Admin Access Pass' : 'Staff Scanner Key'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-4 border-on-background bg-background pl-11 pr-4 py-3 font-label-bold text-sm focus:outline-none focus:neo-shadow-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center font-black text-base py-4 border-4 border-on-background neo-shadow-sm hover-lift press-down uppercase transition-all disabled:opacity-50 mt-4 gap-2 ${
                role === 'organizer'
                  ? 'bg-[#a6f2cf] hover:bg-[#91e1be]'
                  : 'bg-[#ffe5ec] hover:bg-[#ffd1db]'
              }`}
            >
              {loading ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <>
                  <span>ENTER HUB</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
