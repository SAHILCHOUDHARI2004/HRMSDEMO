import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { trainingService } from '../../services/api/training.service';
import {
  AssessmentExamView,
  AssessmentSubmitResult,
} from '../../types/training.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';

export const EmployeeAssessmentExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [exam, setExam] = useState<AssessmentExamView | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(1200); // 20 mins default
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentSubmitResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const startExam = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await trainingService.startAssessment(Number(id));
        setExam(data);
        if (data.time_limit_minutes) {
          setTimeLeftSeconds(data.time_limit_minutes * 60);
        }
      } catch (err: any) {
        error('Exam Access Error', err.response?.data?.detail || 'Could not start examination');
        navigate('/employee/trainings');
      } finally {
        setIsLoading(false);
      }
    };
    startExam();
  }, [id, navigate]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!exam || result) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, result]);

  const handleSelectOption = async (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (exam?.attempt_id) {
      try {
        await trainingService.saveAnswer(exam.attempt_id, questionId, optionId);
      } catch {
        // Handled
      }
    }
  };

  const handleSubmitExam = async () => {
    if (!exam?.attempt_id) return;
    try {
      setIsSubmitting(true);
      const res = await trainingService.submitAssessment(exam.attempt_id);
      setResult(res);
      if (res.passed) {
        success('Exam Passed!', `You scored ${res.percentage}% (${res.score}/${res.max_score}).`);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        warning('Exam Not Passed', `Score: ${res.percentage}%. Passing requirement: ${exam.pass_percentage}%.`);
      }
    } catch (err: any) {
      error('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Initializing secure assessment exam..." fullScreen />;
  }

  // Result Screen
  if (result) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg bg-emerald-50 text-emerald-600">
            {result.passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10 text-rose-600" />}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Result'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {result.passed
                ? 'Congratulations! You have successfully demonstrated qualification in this skill module.'
                : 'You did not achieve the required passing score for this examination.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-xs">
            <div>
              <span className="text-slate-400 block">Final Score</span>
              <strong className="text-base text-slate-900">{result.score} / {result.max_score}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Percentage</span>
              <strong className={`text-base ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.percentage}%
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Status</span>
              <Badge status={result.passed ? 'Approved' : 'Rejected'}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>
          </div>

          <Link to="/employee/trainings" className="block pt-2">
            <Button variant="primary" className="w-full">
              Return to Training Academy
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
    return (
      <Card className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">No Assessment Questions</h3>
        <p className="text-xs text-slate-500 mt-1">This module currently has no active evaluation questions.</p>
        <Link to="/employee/trainings" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">Back</Button>
        </Link>
      </Card>
    );
  }

  const currentQ = exam.questions[currentQIndex];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Exam Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">{exam.title}</h2>
          <span className="text-xs text-slate-500 font-medium">
            Passing requirement: {exam.pass_percentage}% &bull; Question {currentQIndex + 1} of {exam.questions.length}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-sm">
          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {exam.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQIndex(idx)}
            className={`w-8 h-8 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center justify-center ${
              currentQIndex === idx
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : selectedAnswers[q.id]
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Question #{currentQIndex + 1} ({currentQ.points} Point)
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.option_key}
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-blue-950 font-semibold' : 'text-slate-700'}`}>
                  {opt.option_text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQIndex === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {currentQIndex < exam.questions.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentQIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="success"
              size="md"
              onClick={handleSubmitExam}
              isLoading={isSubmitting}
              leftIcon={<Award className="w-4 h-4" />}
            >
              Submit Final Exam ({answeredCount}/{exam.questions.length})
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
