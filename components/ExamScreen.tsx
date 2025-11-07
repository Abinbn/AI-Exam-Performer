
import React, { useState, useEffect } from 'react';
import { Exam, UserAnswer, Question, QuestionType, ExamConfig, EvaluationReport, QuestionFeedback } from '../types';
import { saveExamState } from '../services/storageService';

interface ExamScreenProps {
  exam: Exam;
  examConfig: ExamConfig;
  onSubmit: (answers: UserAnswer[]) => void;
  initialAnswers: UserAnswer[];
  initialTimeLeft?: number | null;
  error?: string | null;
  report?: EvaluationReport | null; // New prop to trigger review mode
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return 'text-slate-600 bg-slate-100';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
};

const ExamScreen: React.FC<ExamScreenProps> = ({ exam, examConfig, onSubmit, initialAnswers, initialTimeLeft, error, report }) => {
  const isReviewMode = !!report;
  const [answers, setAnswers] = useState<UserAnswer[]>(initialAnswers);
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? exam.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(!isReviewMode);

  const currentQuestion = exam.questions[currentQuestionIndex];
  
  // FIX: Safely find the feedback for the current question to prevent crashes on render.
  const questionFeedback = isReviewMode
    ? report.detailedFeedback?.find(f => f.questionId === currentQuestion.id)
    : null;

  // Autosave answers and time to localStorage, but only in exam mode
  useEffect(() => {
    if (!isSubmitting && !isReviewMode) {
      saveExamState({ exam, userAnswers: answers, timeLeft, examConfig });
    }
  }, [answers, timeLeft, exam, isSubmitting, examConfig, isReviewMode]);
  
  // Timer effect
  useEffect(() => {
    let timerId: number | undefined;
    if (isTimerRunning && timeLeft > 0) {
      timerId = window.setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    } else if (timeLeft === 0) {
        setIsTimerRunning(false);
    }
    return () => clearInterval(timerId);
  }, [isTimerRunning, timeLeft]);

  // Auto-submit effect
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting && !isReviewMode) {
      alert("Time is up! Your exam will be submitted automatically.");
      setIsSubmitting(true);
      onSubmit(answers);
    }
  }, [timeLeft, isSubmitting, onSubmit, answers, isReviewMode]);
  
  // Submission failure effect
  useEffect(() => {
    if (error && isSubmitting) {
      setIsSubmitting(false);
      setIsTimerRunning(true); 
    }
  }, [error, isSubmitting]);

  const handleInputChange = (questionId: number, value: string) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(a => (a.questionId === questionId ? { ...a, answer: value } : a))
    );
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, questionId: number) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    handleInputChange(questionId, e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isReviewMode) return;

    const answeredQuestionsCount = answers.filter(a => a.answer.trim() !== '').length;
    const requiredAnswers = Math.ceil(exam.questions.length / 2);

    if (answeredQuestionsCount < requiredAnswers) {
        alert(`You must answer at least 50% of the questions (${requiredAnswers} questions) to submit the exam. You have currently answered ${answeredQuestionsCount}.`);
        return;
    }

    if (timeLeft > 0) {
        const confirmed = window.confirm("Are you sure you want to submit your exam?");
        if (!confirmed) return;
    }
    
    console.log('[ExamScreen] Attempting to submit...');
    setIsTimerRunning(false);
    setIsSubmitting(true);
    console.log('[ExamScreen] isSubmitting state set to true. Calling onSubmit prop.');
    onSubmit(answers);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const userAnswer = answers.find(a => a.questionId === question.id)?.answer || '';
    const isDisabled = isSubmitting || isReviewMode;

    switch (question.type) {
      case QuestionType.MCQ:
        return (
          <div className="space-y-3 mt-4">
            {question.options?.map(option => (
              <label key={option.value} className={`flex items-center p-3 border rounded-lg transition-colors ${isDisabled ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={userAnswer === option.value}
                  onChange={e => handleInputChange(question.id, e.target.value)}
                  className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  disabled={isDisabled}
                />
                <span className="ml-3 text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      default:
        const rows = { short: 3, medium: 6, long: 10 }[question.type];
        return (
          <textarea
            value={userAnswer}
            onChange={e => handleTextareaChange(e, question.id)}
            rows={rows}
            className="mt-4 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 resize-none overflow-y-auto disabled:bg-slate-50 disabled:cursor-not-allowed"
            placeholder="Type your answer here..."
            disabled={isDisabled}
          />
        );
    }
  };

  const renderFeedback = (feedback: QuestionFeedback) => (
      <div className="mt-6 space-y-4">
          <h4 className="font-semibold text-slate-600">AI Feedback:</h4>
          <p className="text-slate-700 p-4 bg-blue-50/70 border-l-4 border-blue-400 rounded-md mt-1">{feedback.feedback}</p>
      </div>
  );

  return (
    <div className="space-y-6">
        <div className="sticky top-[65px] z-5 bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <h2 className="text-xl font-bold text-slate-800">{isReviewMode ? `${exam.title} - Review` : exam.title}</h2>
            <div className="flex items-center space-x-4">
                <span className="text-slate-600 font-medium">Total Marks: {exam.totalMarks}</span>
                {!isReviewMode && (
                    <div className={`font-bold py-2 px-4 rounded-full text-lg transition-colors ${timeLeft <= 60 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'}`}>
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md -mt-2" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center font-medium text-slate-500">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
            </div>

            <div key={currentQuestion.id} className="bg-white p-6 rounded-lg shadow-md min-h-[300px] flex flex-col">
                <div className="flex justify-between items-start">
                    <p className="text-lg font-semibold text-slate-800 flex-1">
                        {`Q${currentQuestionIndex + 1}: ${currentQuestion.text}`}
                    </p>
                    <span className={`ml-4 flex-shrink-0 text-sm font-medium px-2.5 py-0.5 rounded-full ${isReviewMode ? getScoreColor(questionFeedback?.assignedScore ?? 0, currentQuestion.marks) : 'bg-blue-100 text-blue-800'}`}>
                        {isReviewMode 
                            ? `${questionFeedback?.assignedScore ?? 'N/A'} / ${currentQuestion.marks} Marks`
                            : `${currentQuestion.marks} Marks`
                        }
                    </span>
                </div>
                <div className="flex-grow">
                  {renderQuestionInput(currentQuestion)}
                </div>
                {/* FIX: Only render feedback if it exists for the current question */}
                {isReviewMode && questionFeedback && renderFeedback(questionFeedback)}
            </div>

            <div className={`sticky bottom-4 z-5 flex justify-between items-center gap-4 ${isReviewMode ? 'pb-24' : ''}`}>
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="w-1/3 flex justify-center items-center space-x-2 bg-white text-slate-700 font-bold py-3 px-4 rounded-lg shadow-md border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                    <span>Previous</span>
                </button>

                {currentQuestionIndex < exam.questions.length - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="w-2/3 flex justify-center items-center space-x-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95 disabled:bg-slate-400"
                    >
                       <span>Next Question</span>
                    </button>
                ) : !isReviewMode && (
                    <button type="submit" disabled={isSubmitting} className="w-2/3 flex justify-center items-center space-x-3 bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               <span>Submitting Your Answer...</span>
                            </>
                        ) : (
                            <span>Submit Exam</span>
                        )}
                    </button>
                )}
            </div>
        </form>
    </div>
  );
};

export default ExamScreen;
