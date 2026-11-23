import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  FileText,
  Briefcase,
  Target,
  BookOpen,
  Sparkles,
  MessageSquare,
  Map,
  BarChart2,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Layers
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const jobSeekerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'Resume AI', path: '/resume-analysis', icon: FileText },
    { name: 'Job Match', path: '/job-matching', icon: Briefcase },
    { name: 'Skill Gap', path: '/skill-gap', icon: Target },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Enhancer', path: '/enhancer', icon: Sparkles },
    { name: 'Interview', path: '/interview', icon: MessageSquare },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'ML Analytics', path: '/ml-analytics', icon: BarChart2 }
  ];

  const recruiterLinks = [
    { name: 'Recruiter Hub', path: '/recruiter', icon: Users },
    { name: 'Batch Screening', path: '/recruiter?tab=screening', icon: Layers },
    { name: 'ML Analytics', path: '/ml-analytics', icon: BarChart2 }
  ];

  const publicLinks = [
    { name: 'Overview', path: '/' },
    { name: 'ML Architecture', path: '/ml-analytics' }
  ];

  const currentLinks = user
    ? user.role === 'recruiter'
      ? recruiterLinks
      : jobSeekerLinks
    : publicLinks;

  return (
    <nav className="sticky top-0 z-50 frosted-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7765E8] to-[#9BB9FF] p-0.5 flex items-center justify-center shadow-md shadow-[#7765E8]/15 group-hover:shadow-[#7765E8]/30 transition-all">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-[#7765E8] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#25243A] flex items-center gap-1.5">
                ASCEND <span className="text-[#7765E8] font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-[#858397] block -mt-1 tracking-wider uppercase font-medium">Career Intelligence</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#7765E8]/10 text-[#7765E8] border border-[#7765E8]/20 shadow-sm'
                      : 'text-[#858397] hover:text-[#25243A] hover:bg-[#F3F0FF]/80'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#7765E8]' : 'text-[#858397]'}`} />}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Actions / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl bg-white border border-[#EAE7F6] hover:border-[#7765E8]/30 transition-all text-left shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7765E8] to-[#9BB9FF] flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                    {user.name[0]}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-[#25243A] truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-[#7765E8] uppercase tracking-wider font-semibold">{user.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#858397]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-[#EAE7F6] rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#EAE7F6]">
                      <p className="text-xs font-bold text-[#25243A]">{user.name}</p>
                      <p className="text-[11px] text-[#858397] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#7765E8]/10 text-[#7765E8] uppercase">
                        {user.role === 'recruiter' ? 'Recruiter Account' : 'Student / Job Seeker'}
                      </span>
                    </div>

                    <Link
                      to={user.role === 'recruiter' ? '/recruiter' : '/dashboard'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#25243A] hover:bg-[#F3F0FF] transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#7765E8]" />
                      Workspace
                    </Link>

                    <Link
                      to="/ml-analytics"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#25243A] hover:bg-[#F3F0FF] transition-colors"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-[#7765E8]" />
                      Model & EDA Analytics
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#EAE7F6] mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#25243A] hover:text-[#7765E8] hover:bg-[#F3F0FF] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7765E8] to-[#6451D8] hover:from-[#6451D8] hover:to-[#533EC4] text-white shadow-md shadow-[#7765E8]/20 transition-all hover:shadow-lg"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#858397] hover:text-[#25243A] hover:bg-[#F3F0FF]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EAE7F6] bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1">
          {currentLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-[#7765E8]/10 text-[#7765E8]'
                  : 'text-[#858397] hover:text-[#25243A] hover:bg-[#F3F0FF]'
              }`}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-[#EAE7F6]">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-[#858397] px-3">Signed in as <span className="text-[#25243A] font-bold">{user.email}</span></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-bold text-[#25243A] bg-[#F3F0FF] hover:bg-[#EAE7F6]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-bold bg-[#7765E8] text-white hover:bg-[#6451D8] shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
