import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { profileService } from '../../services/api/profile.service';
import { EmployeeProfile } from '../../types/profile.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { getInitials } from '../../utils/formatters';

export const EmployeeProfilePage: React.FC = () => {
  const { success, error } = useToast();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    bloodGroup: 'O+',
  });

  const [contact, setContact] = useState({
    officialEmail: '',
    personalEmail: '',
    mobileNumber: '',
    alternateMobile: '',
    location: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      if (data.personalDetails) {
        setPersonal({
          firstName: data.personalDetails.firstName || data.firstName || '',
          lastName: data.personalDetails.lastName || data.lastName || '',
          gender: data.personalDetails.gender || 'Male',
          dateOfBirth: data.personalDetails.dateOfBirth || '',
          maritalStatus: data.personalDetails.maritalStatus || 'Single',
          bloodGroup: data.personalDetails.bloodGroup || 'O+',
        });
      }
      if (data.contactDetails) {
        setContact({
          officialEmail: data.contactDetails.officialEmail || '',
          personalEmail: data.contactDetails.personalEmail || '',
          mobileNumber: data.contactDetails.mobileNumber || '',
          alternateMobile: data.contactDetails.alternateMobile || '',
          location: data.contactDetails.location || '',
        });
      }
    } catch (err: any) {
      error('Failed to load profile', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await profileService.updateProfile({
        personalDetails: personal,
        contactDetails: contact,
      });
      success('Profile Saved', 'Personal information updated successfully.');
      loadProfile();
    } catch (err: any) {
      error('Save Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !profile) {
    return <LoadingSpinner text="Fetching your employee record..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Profile Hero */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl ring-4 ring-white/10 shrink-0">
            {profile?.initials || getInitials(`${profile?.firstName} ${profile?.lastName}`)}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Employee ID: <span className="text-blue-400 font-bold">{profile?.employeeId}</span> &bull; {profile?.role}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                {profile?.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {contact.officialEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                {contact.mobileNumber}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card header="Personal Identity & Demographics">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={personal.firstName}
              onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={personal.lastName}
              onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
            />
            <Select
              label="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={personal.gender}
              onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={personal.dateOfBirth}
              onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
            />
            <Select
              label="Marital Status"
              options={[
                { label: 'Single', value: 'Single' },
                { label: 'Married', value: 'Married' },
                { label: 'Divorced', value: 'Divorced' },
              ]}
              value={personal.maritalStatus}
              onChange={(e) => setPersonal({ ...personal, maritalStatus: e.target.value })}
            />
            <Select
              label="Blood Group"
              options={[
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
              ]}
              value={personal.bloodGroup}
              onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })}
            />
          </div>
        </Card>

        <Card header="Contact & Residential Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Work Email"
              type="email"
              disabled
              value={contact.officialEmail}
              helperText="Managed by corporate IT administration"
            />
            <Input
              label="Personal Email"
              type="email"
              value={contact.personalEmail}
              onChange={(e) => setContact({ ...contact, personalEmail: e.target.value })}
            />
            <Input
              label="Mobile Number"
              required
              value={contact.mobileNumber}
              onChange={(e) => setContact({ ...contact, mobileNumber: e.target.value })}
            />
            <Input
              label="Alternate Contact Number"
              value={contact.alternateMobile}
              onChange={(e) => setContact({ ...contact, alternateMobile: e.target.value })}
            />
            <div className="col-span-1 sm:col-span-2">
              <Input
                label="Current Residential Address"
                value={contact.location}
                onChange={(e) => setContact({ ...contact, location: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Information
          </Button>
        </div>
      </form>
    </div>
  );
};
