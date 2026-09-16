import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { trainingService } from '../../services/api/training.service';
import { EmployeeTrainingItem } from '../../types/training.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatMinutes } from '../../utils/date';

export const EmployeeTrainingsPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<EmployeeTrainingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Material Viewer Modal
  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [courseView, setCourseView] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await trainingService.getMyTrainings();
      setTrainings(res || []);
    } catch (err: any) {
      error('Failed to load trainings', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCourse = async (item: EmployeeTrainingItem) => {
    try {
      setSelectedTraining(item);
      const viewData = await trainingService.getMyTrainingView(item.training_id || item.id);
      setCourseView(viewData);
      setIsViewerOpen(true);
    } catch (err: any) {
      error('Course View Error', err.message);
    }
  };

  const handleMarkComplete = async (materialId: number) => {
    try {
      const trainingId = selectedTraining?.training_id || selectedTraining?.id;
      if (trainingId) {
        await trainingService.updateMaterialProgress(trainingId, materialId, true);
      }
      success('Progress Saved', 'Material marked as completed.');
      const viewData = await trainingService.getMyTrainingView(selectedTraining.training_id || selectedTraining.id);
      setCourseView(viewData);
      loadData();
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Learning & Skills Academy</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete assigned skill modules, study learning materials, and take qualification examinations.
          </p>
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Fetching your training modules..." />
        </div>
      ) : trainings.length === 0 ? (
        <Card className="py-16 text-center text-slate-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
          <p className="text-sm font-semibold text-slate-700">No training assignments</p>
          <p className="text-xs text-slate-400 mt-1">You are all caught up on mandatory skill certifications.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {item.category}
                  </span>
                  <Badge status={item.progress_status}>{item.progress_status.replace('_', ' ')}</Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || item.learning_objective || 'Core organizational competency module.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-800">{item.completion_percentage || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${item.completion_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatMinutes(item.estimated_duration_minutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {item.materials_count || 1} materials
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenCourse(item)}
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Study Course
                </Button>

                {item.has_assessment && (
                  <Button
                    size="sm"
                    variant={item.assessment_status === 'PASSED' ? 'success' : 'primary'}
                    onClick={() => navigate(`/employee/trainings/${item.training_id || item.id}/exam`)}
                    leftIcon={<Award className="w-4 h-4" />}
                  >
                    {item.assessment_status === 'PASSED' ? `Passed (${item.best_score}%)` : 'Take Exam'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Study Materials Viewer Modal */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        maxWidth="2xl"
        title={courseView?.training?.title || selectedTraining?.title}
        footer={
          <Button variant="secondary" onClick={() => setIsViewerOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Objective</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {courseView?.training?.learning_objective || courseView?.training?.description || 'Review the attached documents and syllabus.'}
            </p>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Course Materials & Syllabus</h4>

          {(!courseView?.materials || courseView.materials.length === 0) ? (
            <p className="text-xs text-slate-400 italic">No downloadable attachments. You may proceed directly to the assessment.</p>
          ) : (
            <div className="space-y-2">
              {courseView.materials.map((m: any) => (
                <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{m.file_name}</h5>
                      <span className="text-[10px] text-slate-400">{m.description || 'Reference Guide'}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={m.is_completed ? 'secondary' : 'primary'}
                    onClick={() => handleMarkComplete(m.id)}
                    leftIcon={m.is_completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : undefined}
                  >
                    {m.is_completed ? 'Completed' : 'Mark Done'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
