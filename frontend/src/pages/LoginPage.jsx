import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, UserCheck, Shield } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate(from === '/' ? '/dashboard' : from);
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach ASCEND AI backend server. Please verify the backend service is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    setError('');
    if (role === 'jobseeker') {
      setEmail('student.demo@ascend.ai');
      setPassword('AscendDemo2026!');
    } else {
      setEmail('recruiter.demo@ascend.ai');
      setPassword('AscendDemo2026!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#7765E8]/10 border border-[#7765E8]/20 items-center justify-center text-[#7765E8] mb-2 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-[#25243A] tracking-tight">
            Welcome Back to ASCEND AI
          </h1>
          <p className="text-sm text-[#858397]">
            Sign in to access your personalized career intelligence workspace
          </p>
        </div>

        {/* Demo Fast Logins for University Evaluator */}
        <div className="p-4 rounded-2xl glass-card border border-white/80 shadow-xs space-y-2.5">
          <div className="text-xs font-bold text-[#212032] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#7765E8]" />
            <span>Evaluator 1-Click Quick Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('jobseeker')}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-white/70 hover:bg-white text-[#7765E8] border border-white/90 flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student Profile</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('recruiter')}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-white/70 hover:bg-white text-[#212032] border border-white/90 flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#7E7C94]" />
              <span>Recruiter Portal</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 sm:p-9 rounded-3xl glass-card border border-white/95 shadow-liquid space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#212032] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7E7C94] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-white/90 text-[#212032] placeholder-[#7E7C94] text-sm focus:outline-none focus:border-[#7765E8] focus:bg-white focus:ring-2 focus:ring-[#7765E8]/10 transition-all font-medium backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212032] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7E7C94] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-white/90 text-[#212032] placeholder-[#7E7C94] text-sm focus:outline-none focus:border-[#7765E8] focus:bg-white focus:ring-2 focus:ring-[#7765E8]/10 transition-all font-medium backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white text-sm shadow-md shadow-[#7765E8]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#858397] font-medium">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#7765E8] hover:underline font-bold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
