export interface TrainingMaterial {
  id: number;
  training_id: number;
  file_name: string;
  storage_path: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  description?: string | null;
  display_order: number;
  is_required: boolean;
  uploaded_by_user_id: number;
  created_at: string;
}

export interface Training {
  id: number;
  title: string;
  code: string;
  category: string;
  description?: string | null;
  learning_objective?: string | null;
  trainer_name?: string | null;
  trainer_user_id?: number | null;
  estimated_duration_minutes: number;
  start_date?: string | null;
  end_date?: string | null;
  status: string; // Draft, Published, Archived
  created_by_user_id: number;
  created_at: string;
  updated_at?: string | null;
  materials?: TrainingMaterial[];
  has_assessment?: boolean;
}

export interface TrainingCreatePayload {
  title: string;
  code: string;
  category: string;
  description?: string | null;
  learning_objective?: string | null;
  trainer_name?: string | null;
  trainer_user_id?: number | null;
  estimated_duration_minutes: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
}

export interface TrainingUpdatePayload extends Partial<TrainingCreatePayload> {}

export interface AssessmentOptionHr {
  id: number;
  question_id: number;
  option_key: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

export interface AssessmentQuestionHr {
  id: number;
  assessment_id: number;
  question_text: string;
  question_type: string;
  points: number;
  explanation?: string | null;
  display_order: number;
  options: AssessmentOptionHr[];
}

export interface AssessmentHrDetail {
  id: number;
  training_id: number;
  title: string;
  description?: string | null;
  pass_percentage: number;
  time_limit_minutes?: number | null;
  max_attempts: number;
  randomize_questions: boolean;
  is_active: boolean;
  questions: AssessmentQuestionHr[];
}

export interface AssessmentOptionCandidate {
  id: number;
  option_key: string;
  option_text: string;
  display_order: number;
}

export interface AssessmentQuestionCandidate {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  display_order: number;
  options: AssessmentOptionCandidate[];
}

export interface AssessmentExamView {
  id: number;
  training_id: number;
  training_title: string;
  title: string;
  description?: string | null;
  pass_percentage: number;
  time_limit_minutes?: number | null;
  max_attempts: number;
  questions: AssessmentQuestionCandidate[];
  attempt_id: number;
  attempt_number: number;
  started_at: string;
}

export interface AssessmentAnswerSubmission {
  question_id: number;
  selected_option_id: number;
}

export interface AssessmentSubmitPayload {
  answers: AssessmentAnswerSubmission[];
}

export interface AssessmentSubmitResult {
  attempt_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  attempt_number: number;
  completed_at: string;
}

export interface EmployeeTrainingItem {
  id: number;
  training_id: number;
  title: string;
  code: string;
  category: string;
  description?: string | null;
  learning_objective?: string | null;
  trainer_name?: string | null;
  estimated_duration_minutes: number;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  progress_status: string; // NOT_STARTED, IN_PROGRESS, COMPLETED
  completion_percentage: number;
  has_assessment: boolean;
  assessment_id?: number | null;
  assessment_status?: string | null; // PENDING, PASSED, FAILED
  best_score?: number | null;
  materials_count: number;
}
