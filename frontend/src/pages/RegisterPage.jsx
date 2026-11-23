import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, ArrowRight, AlertCircle, Briefcase, GraduationCap } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('jobseeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#7765E8]/10 border border-[#7765E8]/20 items-center justify-center text-[#7765E8] mb-2 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-[#25243A] tracking-tight">
            Create Your ASCEND AI Account
          </h1>
          <p className="text-sm text-[#858397]">
            Select your account type to access specialized AI capabilities
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="p-1 rounded-2xl glass-card border border-white/80 grid grid-cols-2 gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => setRole('jobseeker')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'jobseeker'
                ? 'bg-[#7765E8] text-white shadow-sm'
                : 'text-[#7E7C94] hover:text-[#212032]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student / Job Seeker</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'recruiter'
                ? 'bg-[#7765E8] text-white shadow-sm'
                : 'text-[#7E7C94] hover:text-[#212032]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Recruiter / HR</span>
          </button>
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
              <label className="block text-xs font-bold text-[#212032] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7E7C94] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jasleen Kaur"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-white/90 text-[#212032] placeholder-[#7E7C94] text-sm focus:outline-none focus:border-[#7765E8] focus:bg-white focus:ring-2 focus:ring-[#7765E8]/10 transition-all font-medium backdrop-blur-sm"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#858397] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#7765E8] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
