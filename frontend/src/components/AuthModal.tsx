import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Mail, User as UserIcon, Building, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { User, UserRole } from '../types';
import { loginUser, registerUser } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: User) => void;
}

// ONLY 4 Supported Roles in the System
const ALL_ROLES: { role: UserRole; title: string; desc: string; badge: string; publicRegister: boolean }[] = [
  { role: 'STUDENT', title: 'Student', desc: 'Explore campus events feed, schedules & event registrations', badge: 'Campus Life', publicRegister: true },
  { role: 'EVENT_ORGANIZER', title: 'Event Organizer', desc: 'AI event planning, plan editing & execution management', badge: 'Event Manager', publicRegister: true },
  { role: 'HOD', title: 'Head of Department', desc: 'Department event operations, faculty oversight & approvals', badge: 'Operations', publicRegister: false },
  { role: 'SUPER_ADMIN', title: 'Super Admin', desc: 'Master data CRUD, venue & resource governance, audit logs', badge: 'Command Center', publicRegister: false },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialMode === 'signup' ? 'STUDENT' : 'SUPER_ADMIN');
  const [email, setEmail] = useState('superadmin@vignan.ac.in');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Dr. System Administrator');
  const [department, setDepartment] = useState('University Administration');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'signup') {
      setSelectedRole('STUDENT');
      setName('Sai Krishna');
      setEmail('student@vignan.ac.in');
      setPassword('');
      setDepartment('CSE - 3rd Year');
    } else {
      setSelectedRole('SUPER_ADMIN');
      setName('Dr. System Administrator');
      setEmail('superadmin@vignan.ac.in');
      setPassword('');
      setDepartment('University Administration');
    }
    setErrorMsg(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMsg(null);
    if (newMode === 'signup') {
      if (selectedRole !== 'STUDENT' && selectedRole !== 'EVENT_ORGANIZER') {
        setSelectedRole('STUDENT');
        setName('');
        setEmail('');
        setPassword('');
        setDepartment('VFSTR Vadlamudi');
      }
    }
  };

  const handleRoleQuickSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    switch (role) {
      case 'SUPER_ADMIN':
        setName('Dr. System Administrator');
        setEmail('superadmin@vignan.ac.in');
        setPassword('');
        setDepartment('University Administration');
        break;
      case 'HOD':
        setName('Dr. Venkatarama Phani Kumar');
        setEmail('hod.cse@vignan.ac.in');
        setPassword('');
        setDepartment('Computer Science and Engineering (CSE)');
        break;
      case 'EVENT_ORGANIZER':
        setName('Campus Event Lead (SAC)');
        setEmail('organizer@vignan.ac.in');
        setPassword('');
        setDepartment('Student Activity Center (SAC)');
        break;
      case 'STUDENT':
        setName('Sai Krishna');
        setEmail('student@vignan.ac.in');
        setPassword('');
        setDepartment('CSE - 3rd Year');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password, selectedRole);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: selectedRole,
          department: department.trim()
        });
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials or database status.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedRoles = mode === 'signup' 
    ? ALL_ROLES.filter(r => r.publicRegister) 
    : ALL_ROLES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-warm-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-warm-200 dark:border-warm-800 shadow-warm-xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-warm-400 hover:text-warm-700 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-warm-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 mb-2 border border-blush-200 dark:border-blush-800">
            <Shield className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
            <span>4-Tier University Role Authentication</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-warm-950 dark:text-warm-50">
            {mode === 'login' ? 'Sign In to EventOps' : 'Register New Campus Account'}
          </h3>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            {mode === 'login' 
              ? 'Choose your campus role below to access tailored dashboards & permission levels.'
              : 'Create a student or event organizer account to participate in and manage campus events.'}
          </p>
        </div>

        {/* Roles Selector */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-warm-500 mb-2">
            {mode === 'signup' ? 'Select Account Role (Public Registration)' : 'Select Role (4 Supported Campus Roles)'}
          </label>
          <div className={`grid ${mode === 'signup' ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
            {displayedRoles.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleQuickSelect(item.role)}
                className={`p-3 rounded-2xl text-left text-xs transition-all flex flex-col justify-between border ${
                  selectedRole === item.role
                    ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 border-warm-900 dark:border-warm-600 shadow-warm-sm'
                    : 'bg-warm-50 dark:bg-warm-950 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850 border-warm-200 dark:border-warm-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">{item.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      selectedRole === item.role ? 'bg-warm-800 text-blush-300' : 'bg-warm-200/80 dark:bg-warm-800 text-warm-600 dark:text-warm-400'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 line-clamp-2 leading-tight ${selectedRole === item.role ? 'text-warm-300' : 'text-warm-500'}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {mode === 'signup' && (
            <p className="text-[10px] text-warm-400 dark:text-warm-500 mt-2">
              Note: Super Admin and HOD accounts are administrative and pre-provisioned.
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-warm-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400"
                  placeholder="e.g. Sai Krishna"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
              University Email (@vignan.ac.in)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-warm-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400"
                placeholder="name@vignan.ac.in"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
              Department / Unit
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-warm-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-warm-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 font-bold text-xs shadow-warm-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{isLoading ? 'Authenticating...' : mode === 'login' ? `Sign In as ${selectedRole.replace('_', ' ')}` : `Create ${selectedRole.replace('_', ' ')} Account`}</span>
            <ArrowRight className="w-4 h-4 text-blush-300" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-warm-500">
          {mode === 'login' ? (
            <p>
              Student or Organizer?{' '}
              <button
                onClick={() => handleModeSwitch('signup')}
                className="font-bold text-blush-700 hover:underline dark:text-blush-300"
              >
                Sign Up Here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => handleModeSwitch('login')}
                className="font-bold text-blush-700 hover:underline dark:text-blush-300"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
