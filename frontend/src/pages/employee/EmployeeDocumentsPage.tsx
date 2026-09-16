import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  Trash2,
} from 'lucide-react';
import { documentService } from '../../services/api/document.service';
import { EmployeeDocumentsPageResponse, EmployeeDocumentItem } from '../../types/document.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDateTime } from '../../utils/date';
import { formatFileSize } from '../../utils/formatters';

export const EmployeeDocumentsPage: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<EmployeeDocumentsPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await documentService.getMyDocuments();
      setData(res);
    } catch (err: any) {
      error('Failed to load documents', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedFile) {
      error('Selection Missing', 'Please select a document type and a file.');
      return;
    }

    try {
      setIsUploading(true);
      await documentService.uploadDocument(selectedType, selectedFile, description);
      success('Document Uploaded', 'Submitted for HR verification.');
      setIsUploadOpen(false);
      setSelectedFile(null);
      setDescription('');
      loadData();
    } catch (err: any) {
      error('Upload Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: EmployeeDocumentItem) => {
    if (!doc.document_id) return;
    try {
      const blob = await documentService.downloadDocument(doc.document_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || `${doc.document_type_name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      error('Download Failed', 'Could not download file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Compliance Documents & KYC</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload required identity documents, educational certificates, and track compliance verification.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            if (data?.documents?.length) {
              setSelectedType(data.documents[0].document_type_id);
            }
            setIsUploadOpen(true);
          }}
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {/* KPI Progress Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Overall Compliance Health
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {data?.summary?.completion_percentage || 100}% Completed
            </h3>
            <p className="text-xs text-blue-200">
              {data?.summary?.verified || 0} of {data?.summary?.total_required || 0} mandatory files verified by HR.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center min-w-[80px]">
              <span className="text-lg font-bold block">{data?.summary?.verified || 0}</span>
              <span className="text-[11px] text-blue-200">Verified</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center min-w-[80px]">
              <span className="text-lg font-bold block">{data?.summary?.pending_review || 0}</span>
              <span className="text-[11px] text-amber-300">Pending</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center min-w-[80px]">
              <span className="text-lg font-bold block">{data?.summary?.missing || 0}</span>
              <span className="text-[11px] text-rose-300">Missing</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching document checklist..." />
          </div>
        ) : !data?.documents || data.documents.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No documents configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Uploaded File</th>
                  <th className="py-3 px-4">Uploaded At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.documents.map((doc) => (
                  <tr key={doc.document_type_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {doc.document_type_name}
                      {doc.is_required && (
                        <span className="ml-1.5 text-[10px] text-rose-500 font-semibold uppercase">*Required</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{doc.category}</td>
                    <td className="py-3.5 px-4">
                      {doc.file_name ? (
                        <div>
                          <span className="font-medium text-slate-800 block truncate max-w-xs">{doc.file_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{formatFileSize(doc.file_size || 0)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Uploaded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {doc.uploaded_at ? formatDateTime(doc.uploaded_at) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={doc.status}>{doc.status}</Badge>
                      {doc.rejection_reason && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">
                          Note: {doc.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        {doc.document_id ? (
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedType(doc.document_type_id);
                              setIsUploadOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs"
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        maxWidth="md"
        title="Upload Compliance Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUploadSubmit} isLoading={isUploading}>
              Upload File
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Document Requirement"
            options={(data?.documents || []).map((d) => ({
              label: `${d.document_type_name} (${d.category})`,
              value: d.document_type_id,
            }))}
            value={selectedType || ''}
            onChange={(e) => setSelectedType(Number(e.target.value))}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Document File (PDF, PNG, JPG)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Government issued Passport copy"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
