import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { documentService } from '../../services/api/document.service';
import {
  DocumentType,
  DocumentTypeCreatePayload,
  HrDocumentOverviewKPI,
} from '../../types/document.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDateTime, formatDate } from '../../utils/date';
import { formatFileSize } from '../../utils/formatters';

export const HrDocumentVerificationPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'types'>('pending');
  const [kpi, setKpi] = useState<HrDocumentOverviewKPI | null>(null);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Document Type Modal
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeForm, setTypeForm] = useState<DocumentTypeCreatePayload>({
    name: '',
    code: '',
    category: 'Identity',
    required_default: true,
    allowed_file_types: 'pdf,jpg,png',
    max_file_size_mb: 5,
    multiple_allowed: false,
    is_active: true,
  });

  // Verify / Reject Modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [remarksOrReason, setRemarksOrReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [kpiRes, typesRes, pendingRes] = await Promise.all([
        documentService.getHrOverview().catch(() => null),
        documentService.getDocumentTypes().catch(() => []),
        documentService.getHrPending().catch(() => ({ items: [] })),
      ]);
      setKpi(kpiRes);
      setDocTypes(typesRes);
      setPendingDocs(pendingRes.items || []);
    } catch (err: any) {
      error('Failed to load document verification hub', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `document_${docId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      error('Download Failed', 'Could not download document file');
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      await documentService.createDocumentType(typeForm);
      success('Document Type Added', typeForm.name);
      setIsTypeModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActionSubmit = async () => {
    if (!selectedDoc) return;
    try {
      setIsActionLoading(true);
      if (actionType === 'verify') {
        await documentService.verifyDocument(selectedDoc.id, remarksOrReason);
        success('Document Verified', 'Employee document successfully verified.');
      } else {
        await documentService.rejectDocument(selectedDoc.id, remarksOrReason);
        success('Document Rejected', 'Rejection notice dispatched to employee.');
      }
      setIsActionModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Action Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Verification & Compliance</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review submitted KYC certificates, authenticate employee credentials, and enforce compliance policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'pending' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('pending')}
          >
            Pending Reviews
          </Button>
          <Button
            variant={activeTab === 'types' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('types')}
          >
            Document Types
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Pending Verification</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{kpi?.documents_pending || pendingDocs.length}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Verified Documents</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{kpi?.documents_verified || 0}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Rejected / Re-upload</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{kpi?.documents_rejected || 0}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Configured Types</p>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{docTypes.length}</h3>
        </Card>
      </div>

      {activeTab === 'pending' ? (
        <Card noPadding>
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner text="Fetching pending document queue..." />
            </div>
          ) : pendingDocs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">All submissions verified</p>
              <p className="text-xs text-slate-400 mt-1">No employee files currently awaiting verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">File Name & Size</th>
                    <th className="py-3 px-4">Uploaded At</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {doc.employee_name || `Employee #${doc.employee_id}`}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600">
                        {doc.document_type_name || doc.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block truncate max-w-xs">{doc.file_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{formatFileSize(doc.file_size)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDateTime(doc.uploaded_at)}</td>
                      <td className="py-3.5 px-4"><Badge status={doc.status}>{doc.status}</Badge></td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleDownload(doc.id, doc.file_name)}
                            title="Download File"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setActionType('verify');
                              setRemarksOrReason('');
                              setIsActionModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs"
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setActionType('reject');
                              setRemarksOrReason('');
                              setIsActionModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card
          header="Configured Compliance Document Requirements"
          headerRight={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTypeModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Document Type
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Allowed Formats</th>
                  <th className="py-3 px-4">Max Size</th>
                  <th className="py-3 px-4">Mandatory</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {docTypes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.name} ({t.code})</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{t.category}</td>
                    <td className="py-3.5 px-4 font-mono text-xs uppercase text-slate-500">{t.allowed_file_types}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{t.max_file_size_mb} MB</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary">{t.required_default ? 'Required' : 'Optional'}</Badge>
                    </td>
                    <td className="py-3.5 px-4"><Badge status={t.is_active ? 'Active' : 'Inactive'}>{t.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Document Type Modal */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        maxWidth="md"
        title="Add Compliance Document Type"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsTypeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateType} isLoading={isActionLoading}>Create Type</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Document Name" required value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} />
          <Input label="Code" required value={typeForm.code} onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })} />
          <Select
            label="Category"
            options={[
              { label: 'Identity / KYC', value: 'Identity' },
              { label: 'Educational Degree', value: 'Education' },
              { label: 'Previous Experience', value: 'Experience' },
              { label: 'Medical / Insurance', value: 'Medical' },
              { label: 'Bank / Financial', value: 'Financial' },
            ]}
            value={typeForm.category}
            onChange={(e) => setTypeForm({ ...typeForm, category: e.target.value })}
          />
          <Input label="Allowed File Extensions" value={typeForm.allowed_file_types} onChange={(e) => setTypeForm({ ...typeForm, allowed_file_types: e.target.value })} />
          <Input label="Max File Size (MB)" type="number" value={typeForm.max_file_size_mb} onChange={(e) => setTypeForm({ ...typeForm, max_file_size_mb: Number(e.target.value) })} />
        </form>
      </Modal>

      {/* Verify / Reject Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        maxWidth="md"
        title={actionType === 'verify' ? 'Confirm Document Verification' : 'Reject Document'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
            <Button
              variant={actionType === 'verify' ? 'success' : 'danger'}
              onClick={handleActionSubmit}
              isLoading={isActionLoading}
            >
              {actionType === 'verify' ? 'Approve Verification' : 'Confirm Rejection'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            {actionType === 'verify'
              ? 'Verify that this document meets standard compliance criteria.'
              : 'Please enter the reason for rejection. The employee will be prompted to re-upload.'}
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              {actionType === 'verify' ? 'Remarks (Optional)' : 'Rejection Reason (Required)'}
            </label>
            <textarea
              rows={3}
              required={actionType === 'reject'}
              value={remarksOrReason}
              onChange={(e) => setRemarksOrReason(e.target.value)}
              placeholder={actionType === 'verify' ? 'Verified against records' : 'e.g. Document image is blurry or expired'}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
