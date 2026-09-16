import { apiClient } from './apiClient';
import {
  DocumentType,
  DocumentTypeCreatePayload,
  DocumentVersion,
  EmployeeDocumentsPageResponse,
  HrDocumentOverviewKPI,
} from '../../types/document.types';

export const documentService = {
  async getDocumentTypes(): Promise<DocumentType[]> {
    const response = await apiClient.get<DocumentType[]>('/documents/types');
    return response.data;
  },

  async createDocumentType(payload: DocumentTypeCreatePayload): Promise<DocumentType> {
    const response = await apiClient.post<DocumentType>('/documents/types', payload);
    return response.data;
  },

  async updateDocumentType(typeId: number, payload: Partial<DocumentTypeCreatePayload>): Promise<DocumentType> {
    const response = await apiClient.put<DocumentType>(`/documents/types/${typeId}`, payload);
    return response.data;
  },

  async deleteDocumentType(typeId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/documents/types/${typeId}`);
    return response.data;
  },

  async getMyDocuments(): Promise<EmployeeDocumentsPageResponse> {
    const response = await apiClient.get<EmployeeDocumentsPageResponse>('/documents/my-documents');
    return response.data;
  },

  async uploadDocument(documentTypeId: number, file: File, description?: string): Promise<any> {
    const formData = new FormData();
    formData.append('document_type_id', documentTypeId.toString());
    formData.append('file', file);
    if (description) formData.append('description', description);

    const response = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async downloadDocument(docId: number): Promise<Blob> {
    const response = await apiClient.get(`/documents/${docId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getDocumentVersions(docId: number): Promise<DocumentVersion[]> {
    const response = await apiClient.get<DocumentVersion[]>(`/documents/${docId}/history`);
    return response.data;
  },

  async getHrOverview(): Promise<HrDocumentOverviewKPI> {
    const response = await apiClient.get<HrDocumentOverviewKPI>('/documents/hr/overview');
    return response.data;
  },

  async getHrPending(page = 1, pageSize = 10): Promise<any> {
    const response = await apiClient.get('/documents/hr/pending', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getHrEmployeeDocuments(employeeId: number): Promise<EmployeeDocumentsPageResponse> {
    const response = await apiClient.get<EmployeeDocumentsPageResponse>(`/documents/hr/employees/${employeeId}`);
    return response.data;
  },

  async verifyDocument(docId: number, remarks?: string): Promise<any> {
    const response = await apiClient.post(`/documents/hr/${docId}/verify`, { remarks });
    return response.data;
  },

  async rejectDocument(docId: number, reason: string): Promise<any> {
    const response = await apiClient.post(`/documents/hr/${docId}/reject`, { reason });
    return response.data;
  },

  async deleteHrDocument(docId: number): Promise<any> {
    const response = await apiClient.delete(`/documents/hr/${docId}`);
    return response.data;
  },
};
