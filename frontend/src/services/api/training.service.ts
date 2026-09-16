import { apiClient } from './apiClient';
import {
  Training,
  TrainingCreatePayload,
  TrainingUpdatePayload,
  AssessmentHrDetail,
  AssessmentExamView,
  AssessmentSubmitResult,
  EmployeeTrainingItem,
} from '../../types/training.types';

export const trainingService = {
  async listTrainings(status?: string, category?: string): Promise<Training[]> {
    const params = { status, category };
    const response = await apiClient.get<any>('/trainings', { params });
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data?.items || [];
  },

  async getTraining(id: number): Promise<Training> {
    const response = await apiClient.get<Training>(`/trainings/${id}`);
    return response.data;
  },

  async createTraining(payload: TrainingCreatePayload): Promise<Training> {
    const response = await apiClient.post<Training>('/trainings', payload);
    return response.data;
  },

  async updateTraining(id: number, payload: TrainingUpdatePayload): Promise<Training> {
    const response = await apiClient.put<Training>(`/trainings/${id}`, payload);
    return response.data;
  },

  async deleteTraining(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/trainings/${id}`);
    return response.data;
  },

  async uploadMaterial(trainingId: number, file: File, description?: string, isRequired = true): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    formData.append('is_required', isRequired.toString());

    const response = await apiClient.post(`/trainings/${trainingId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteMaterial(trainingId: number, materialId: number): Promise<any> {
    const response = await apiClient.delete(`/trainings/${trainingId}/materials/${materialId}`);
    return response.data;
  },

  async getAssessment(trainingId: number): Promise<AssessmentHrDetail> {
    const response = await apiClient.get<any>(`/trainings/${trainingId}/assessment`);
    const data = response.data;
    return {
      id: data.id,
      training_id: data.training_id,
      title: data.title,
      description: data.description,
      pass_percentage: data.passing_percentage ?? data.pass_percentage ?? 70,
      time_limit_minutes: data.duration_minutes ?? data.time_limit_minutes ?? 20,
      max_attempts: data.max_attempts ?? 3,
      randomize_questions: Boolean(data.randomize_questions),
      is_active: data.status === 'Published',
      questions: (data.questions || []).map((q: any) => ({
        id: q.id,
        assessment_id: q.assessment_id,
        question_text: q.question_text,
        question_type: q.question_type || 'MCQ',
        points: q.marks ?? q.points ?? 1,
        explanation: q.explanation,
        display_order: q.display_order ?? 1,
        options: (q.options || []).map((o: any) => ({
          id: o.id,
          question_id: o.question_id,
          option_key: o.option_key || '',
          option_text: o.option_text || '',
          is_correct: Boolean(o.is_correct),
          display_order: o.display_order ?? 1,
        })),
      })),
    };
  },

  async saveAssessment(trainingId: number, payload: any): Promise<any> {
    const body = {
      title: payload.title || 'Assessment',
      description: payload.description,
      instructions: payload.instructions,
      duration_minutes: payload.duration_minutes ?? payload.time_limit_minutes ?? 30,
      passing_percentage: payload.passing_percentage ?? payload.pass_percentage ?? 60.0,
      max_attempts: payload.max_attempts ?? 3,
      randomize_questions: Boolean(payload.randomize_questions),
      randomize_options: Boolean(payload.randomize_options),
      show_result: payload.show_result ?? true,
      show_correct_answers: payload.show_correct_answers ?? false,
      status: payload.status || 'Published',
    };
    const response = await apiClient.post(`/trainings/${trainingId}/assessment`, body);
    return response.data;
  },

  async addQuestion(assessmentId: number, payload: any): Promise<any> {
    const body = {
      question_text: payload.question_text,
      marks: payload.marks ?? payload.points ?? 1.0,
      difficulty: payload.difficulty || 'Medium',
      explanation: payload.explanation,
      display_order: payload.display_order ?? 1,
      options: (payload.options || []).map((o: any, idx: number) => ({
        option_key: o.option_key || ['A', 'B', 'C', 'D'][idx] || 'A',
        option_text: o.option_text || '',
        is_correct: Boolean(o.is_correct),
      })),
    };
    const response = await apiClient.post(`/trainings/assessments/${assessmentId}/questions`, body);
    return response.data;
  },

  async updateQuestion(questionId: number, payload: any): Promise<any> {
    const response = await apiClient.put(`/trainings/assessment/questions/${questionId}`, payload);
    return response.data;
  },

  async deleteQuestion(assessmentId: number, questionId: number): Promise<any> {
    const response = await apiClient.delete(`/trainings/assessments/${assessmentId}/questions/${questionId}`);
    return response.data;
  },

  async getMyTrainings(): Promise<EmployeeTrainingItem[]> {
    const response = await apiClient.get<any>('/trainings/my/all');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data?.items || [];
  },

  async getMyTrainingView(trainingId: number): Promise<any> {
    const response = await apiClient.get(`/trainings/my/${trainingId}`);
    return response.data;
  },

  async updateMaterialProgress(trainingId: number, materialId: number, isCompleted = true): Promise<any> {
    const response = await apiClient.post(`/trainings/my/${trainingId}/materials/${materialId}/progress`, {
      progress_percentage: isCompleted ? 100.0 : 0.0,
      is_completed: isCompleted,
    });
    return response.data;
  },

  async startAssessment(trainingOrAssessmentId: number): Promise<AssessmentExamView> {
    let assessmentId = trainingOrAssessmentId;
    try {
      const response = await apiClient.post<any>(`/trainings/assessments/${assessmentId}/attempts/start`);
      return normalizeExamResponse(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        const view = await this.getMyTrainingView(trainingOrAssessmentId);
        if (view?.assessment_id) {
          assessmentId = view.assessment_id;
          const retryRes = await apiClient.post<any>(`/trainings/assessments/${assessmentId}/attempts/start`);
          return normalizeExamResponse(retryRes.data);
        }
      }
      throw err;
    }
  },

  async saveAnswer(attemptId: number, questionId: number, selectedOptionId: number): Promise<any> {
    const response = await apiClient.post(`/trainings/attempts/${attemptId}/save-answer`, {
      question_id: questionId,
      selected_option_id: selectedOptionId,
    });
    return response.data;
  },

  async submitAssessment(attemptId: number): Promise<AssessmentSubmitResult> {
    const response = await apiClient.post<any>(`/trainings/attempts/${attemptId}/submit`);
    const data = response.data;
    return {
      attempt_id: data.attempt_id,
      score: data.score ?? 0,
      max_score: data.total_marks ?? 100,
      percentage: data.percentage ?? 0,
      passed: Boolean(data.passed),
      attempt_number: 1,
      completed_at: typeof data.submitted_at === 'string' ? data.submitted_at : new Date().toISOString(),
    };
  },
};

function normalizeExamResponse(data: any): AssessmentExamView {
  return {
    id: data.assessment_id || data.id,
    training_id: data.training_id || 0,
    training_title: data.assessment_title || data.training_title || 'Training Assessment',
    title: data.assessment_title || data.title || 'Assessment',
    description: data.instructions || data.description,
    pass_percentage: data.passing_percentage ?? data.pass_percentage ?? 70,
    time_limit_minutes: data.duration_minutes ?? data.time_limit_minutes ?? 20,
    max_attempts: data.max_attempts ?? 3,
    attempt_id: data.attempt_id,
    attempt_number: data.attempt_number ?? 1,
    started_at: typeof data.started_at === 'string' ? data.started_at : new Date().toISOString(),
    questions: (data.questions || []).map((q: any) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type || 'single_choice',
      points: q.marks ?? q.points ?? 1,
      display_order: q.display_order ?? 1,
      options: (q.options || []).map((o: any) => ({
        id: o.id,
        option_key: o.option_key || '',
        option_text: o.option_text || '',
        display_order: o.display_order ?? 1,
      })),
    })),
  };
}
