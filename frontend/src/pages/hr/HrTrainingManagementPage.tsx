import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Upload,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Send,
} from 'lucide-react';
import { trainingService } from '../../services/api/training.service';
import {
  Training,
  TrainingCreatePayload,
  AssessmentHrDetail,
} from '../../types/training.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatMinutes } from '../../utils/date';

export const HrTrainingManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Training Creation/Edit Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [courseForm, setCourseForm] = useState<TrainingCreatePayload>({
    title: '',
    code: '',
    category: 'Engineering & DevOps',
    description: '',
    learning_objective: '',
    estimated_duration_minutes: 60,
    status: 'Published',
  });

  // Assessment Builder Modal
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentHrDetail | null>(null);
  const [passPercentage, setPassPercentage] = useState<number>(75);
  const [timeLimit, setTimeLimit] = useState<number>(20);

  // Add Question State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState([
    { option_key: 'A', option_text: '', is_correct: true, display_order: 1 },
    { option_key: 'B', option_text: '', is_correct: false, display_order: 2 },
    { option_key: 'C', option_text: '', is_correct: false, display_order: 3 },
    { option_key: 'D', option_text: '', is_correct: false, display_order: 4 },
  ]);

  const loadTrainings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await trainingService.listTrainings();
      setTrainings(res || []);
    } catch (err: any) {
      error('Failed to load courses', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

  const handleOpenCreateCourse = () => {
    setIsEdit(false);
    setSelectedTraining(null);
    setCourseForm({
      title: '',
      code: '',
      category: 'Engineering & DevOps',
      description: '',
      learning_objective: '',
      estimated_duration_minutes: 60,
      status: 'Published',
    });
    setIsCourseModalOpen(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      if (isEdit && selectedTraining) {
        await trainingService.updateTraining(selectedTraining.id, courseForm);
        success('Course Updated', courseForm.title);
      } else {
        await trainingService.createTraining(courseForm);
        success('Course Created', courseForm.title);
      }
      setIsCourseModalOpen(false);
      loadTrainings();
    } catch (err: any) {
      error('Course Action Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenAssessmentBuilder = async (course: Training) => {
    try {
      setSelectedTraining(course);
      setIsLoading(true);
      const assessment = await trainingService.getAssessment(course.id).catch(() => null);
      if (assessment) {
        setAssessmentData(assessment);
        setPassPercentage(assessment.pass_percentage || 75);
        setTimeLimit(assessment.time_limit_minutes || 20);
      } else {
        setAssessmentData(null);
        setPassPercentage(75);
        setTimeLimit(20);
      }
      setIsAssessmentOpen(true);
    } catch (err: any) {
      error('Assessment Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!selectedTraining) return;
    try {
      setIsActionLoading(true);
      await trainingService.saveAssessment(selectedTraining.id, {
        title: `${selectedTraining.title} - Final Assessment`,
        pass_percentage: passPercentage,
        time_limit_minutes: timeLimit,
        max_attempts: 3,
        randomize_questions: true,
        is_active: true,
      });
      success('Assessment Configured', 'Course exam rules updated.');
      const updated = await trainingService.getAssessment(selectedTraining.id);
      setAssessmentData(updated);
    } catch (err: any) {
      error('Failed to save assessment', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!assessmentData || !newQuestionText.trim()) return;
    try {
      setIsActionLoading(true);
      await trainingService.addQuestion(assessmentData.id, {
        question_text: newQuestionText,
        question_type: 'MCQ',
        points: 1,
        options: newOptions,
      });
      success('Question Added', 'Added MCQ question to assessment.');
      setNewQuestionText('');
      const updated = await trainingService.getAssessment(selectedTraining!.id);
      setAssessmentData(updated);
    } catch (err: any) {
      error('Failed to add question', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Training Programs & Assessments</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build curriculum modules, attach learning content, and administer automated knowledge evaluations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateCourse}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Training Course
        </Button>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Fetching training courses..." />
        </div>
      ) : trainings.length === 0 ? (
        <Card className="py-16 text-center text-slate-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
          <p className="text-sm font-semibold text-slate-700">No training courses published</p>
          <p className="text-xs text-slate-400 mt-1">Click above to author your first employee training course.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {course.category}
                  </span>
                  <Badge status={course.status}>{course.status}</Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {course.description || course.learning_objective || 'General workplace competency module.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatMinutes(course.estimated_duration_minutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {course.materials?.length || 0} materials
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenAssessmentBuilder(course)}
                  leftIcon={<HelpCircle className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Manage Exam
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedTraining(course);
                      setIsEdit(true);
                      setCourseForm({
                        title: course.title,
                        code: course.code,
                        category: course.category,
                        description: course.description || '',
                        learning_objective: course.learning_objective || '',
                        estimated_duration_minutes: course.estimated_duration_minutes,
                        status: course.status,
                      });
                      setIsCourseModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete ${course.title}?`)) {
                        await trainingService.deleteTraining(course.id);
                        success('Course Deleted', course.title);
                        loadTrainings();
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Course Create/Edit Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        maxWidth="lg"
        title={isEdit ? 'Edit Training Course' : 'Create New Training Program'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCourseModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCourseSubmit} isLoading={isActionLoading}>
              {isEdit ? 'Save Changes' : 'Publish Course'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Course Title"
            required
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              required
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
            />
            <Select
              label="Category"
              options={[
                { label: 'Engineering & DevOps', value: 'Engineering & DevOps' },
                { label: 'Security & Compliance', value: 'Security & Compliance' },
                { label: 'Human Resource & Policy', value: 'Human Resource & Policy' },
                { label: 'Product & Design', value: 'Product & Design' },
              ]}
              value={courseForm.category}
              onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              value={courseForm.estimated_duration_minutes}
              onChange={(e) => setCourseForm({ ...courseForm, estimated_duration_minutes: Number(e.target.value) })}
            />
            <Select
              label="Course Status"
              options={[
                { label: 'Published (Active)', value: 'Published' },
                { label: 'Draft', value: 'Draft' },
                { label: 'Archived', value: 'Archived' },
              ]}
              value={courseForm.status}
              onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Learning Objective
            </label>
            <textarea
              rows={2}
              value={courseForm.learning_objective || ''}
              onChange={(e) => setCourseForm({ ...courseForm, learning_objective: e.target.value })}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* Assessment Builder Modal */}
      <Modal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        maxWidth="2xl"
        title={`Assessment Exam - ${selectedTraining?.title}`}
        footer={
          <Button variant="secondary" onClick={() => setIsAssessmentOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Rules Config */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Exam Passing Rules</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Passing Percentage (%)"
                type="number"
                value={passPercentage}
                onChange={(e) => setPassPercentage(Number(e.target.value))}
              />
              <Input
                label="Time Limit (Minutes)"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
            </div>
            <Button size="sm" variant="secondary" onClick={handleSaveAssessment} isLoading={isActionLoading}>
              Save Exam Rules
            </Button>
          </div>

          {/* Existing Questions List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Configured Exam Questions ({assessmentData?.questions?.length || 0})
            </h4>

            {(!assessmentData?.questions || assessmentData.questions.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No questions added yet. Add multiple choice questions below.</p>
            ) : (
              <div className="space-y-3">
                {assessmentData.questions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-xs text-slate-900">
                        {idx + 1}. {q.question_text}
                      </span>
                      <button
                        onClick={async () => {
                          await trainingService.deleteQuestion(assessmentData!.id, q.id);
                          const updated = await trainingService.getAssessment(selectedTraining!.id);
                          setAssessmentData(updated);
                        }}
                        className="text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border text-[11px] ${
                            opt.is_correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold' : 'border-slate-100 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <strong>{opt.option_key}:</strong> {opt.option_text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Question Form */}
          {assessmentData && (
            <div className="p-4 border border-blue-100 bg-blue-50/40 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-blue-900">Add New Multiple Choice Question</h4>
              <Input
                label="Question Text"
                placeholder="e.g. What is the standard protocol for git commit messages?"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                {newOptions.map((opt, i) => (
                  <div key={opt.option_key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">Option {opt.option_key}</span>
                      <label className="flex items-center gap-1 cursor-pointer text-emerald-700 font-medium">
                        <input
                          type="radio"
                          name="correct_opt"
                          checked={opt.is_correct}
                          onChange={() => {
                            setNewOptions((prev) =>
                              prev.map((o, idx) => ({ ...o, is_correct: idx === i }))
                            );
                          }}
                        />
                        Correct
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={`Text for option ${opt.option_key}`}
                      value={opt.option_text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewOptions((prev) =>
                          prev.map((o, idx) => (idx === i ? { ...o, option_text: val } : o))
                        );
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white"
                    />
                  </div>
                ))}
              </div>
              <Button size="sm" variant="primary" onClick={handleAddQuestion} isLoading={isActionLoading}>
                Add Question
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
