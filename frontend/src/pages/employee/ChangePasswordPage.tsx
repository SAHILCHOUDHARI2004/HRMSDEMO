import React, { useState } from 'react';
import { Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/api/auth.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../services/api/apiClient';

export const ChangePasswordPage: React.FC = () => {
  const { success, error } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      success('Password Updated', 'Your security credentials have been refreshed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      error('Password Change Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Credentials</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update your portal login password to keep your enterprise account secure.
        </p>
      </div>

      <Card header="Change Account Password">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Key className="w-4 h-4" />}
            helperText="Must be at least 8 characters"
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <div className="pt-3">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
