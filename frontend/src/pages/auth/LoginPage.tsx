import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { getErrorMessage } from '../../services/api/apiClient';

export const LoginPage: React.FC = () => {
  const { login, switchDashboard } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Multi-dashboard selection modal state
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [availableDashboards, setAvailableDashboards] = useState<string[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const res = await login({ email, password });

      if (res.requiresDashboardSelection && res.availableDashboards) {
        setAvailableDashboards(res.availableDashboards);
        setSelectedDashboard(res.availableDashboards[0]);
        setShowDashboardModal(true);
        return;
      }

      const role = res.me?.activeDashboard || res.me?.role.toLowerCase() || 'employee';
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await login({ email, password, activeDashboard: selectedDashboard });
      setShowDashboardModal(false);
      navigate(`/${selectedDashboard}/dashboard`);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/30 mb-4 ring-8 ring-blue-500/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AIVAN <span className="text-blue-400">HRMS</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to your workplace portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-500 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Demo Credentials Available:
            </p>
            <div className="grid grid-cols-1 gap-1 text-[11px] font-mono text-slate-400">
              <div
                onClick={() => {
                  setEmail('admin@aivan.com');
                  setPassword('Admin@123');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors flex justify-between"
              >
                <span>Admin: admin@aivan.com</span>
                <span className="text-slate-500">Admin@123</span>
              </div>
              <div
                onClick={() => {
                  setEmail('hr@aivan.com');
                  setPassword('Hr@12345');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors flex justify-between"
              >
                <span>HR: hr@aivan.com</span>
                <span className="text-slate-500">Hr@12345</span>
              </div>
              <div
                onClick={() => {
                  setEmail('john.doe@aivan.com');
                  setPassword('Emp@1234');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors flex justify-between"
              >
                <span>Emp: john.doe@aivan.com</span>
                <span className="text-slate-500">Emp@1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role / Dashboard Selection Modal */}
      <Modal
        isOpen={showDashboardModal}
        onClose={() => setShowDashboardModal(false)}
        maxWidth="md"
        title="Select Portal to Access"
        footer={
          <Button variant="primary" onClick={handleConfirmDashboard} isLoading={isLoading}>
            Continue to Portal
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Your account has access to multiple roles. Please select which dashboard you would like to enter:
          </p>
          <div className="space-y-2">
            {availableDashboards.map((dash) => (
              <label
                key={dash}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDashboard === dash
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="dashboard"
                  value={dash}
                  checked={selectedDashboard === dash}
                  onChange={(e) => setSelectedDashboard(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="capitalize text-sm">{dash} Dashboard</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
