
import React, { useState, useCallback, useEffect } from 'react';
import { ExamConfig, Exam, EvaluationReport, AppState, UserAnswer } from './types';
import ConfigScreen from './components/ConfigScreen';
import ExamScreen from './components/ExamScreen';
import ReportScreen from './components/ReportScreen';
import Header from './components/Header';
import { generateExam, evaluateExam } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import { loadExamState, clearExamState } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CONFIG);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialTimeLeft, setInitialTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // On initial load, check for a saved exam session
    const savedState = loadExamState();
    if (savedState) {
      setExam(savedState.exam);
      setUserAnswers(savedState.userAnswers);
      setInitialTimeLeft(savedState.timeLeft);
      setAppState(AppState.EXAM);
    }
  }, []);


  const handleStartExam = useCallback(async (config: ExamConfig) => {
    setAppState(AppState.GENERATING);
    setError(null);
    setExamConfig(config);
    try {
      const generatedExam = await generateExam(config);
      // Sort questions by marks in ascending order as a safeguard
      const sortedQuestions = [...generatedExam.questions].sort((a, b) => a.marks - b.marks);
      const examWithSortedQuestions = { ...generatedExam, questions: sortedQuestions };

      setExam(examWithSortedQuestions);
      setUserAnswers(examWithSortedQuestions.questions.map(q => ({ questionId: q.id, answer: '' })));
      setInitialTimeLeft(null); // Reset for new exam
      setAppState(AppState.EXAM);
    } catch (err) {
      console.error(err);
      setError('Failed to generate the exam. Please check your API key and try again.');
      setAppState(AppState.CONFIG);
    }
  }, []);

  const handleSubmitExam = useCallback(async (answers: UserAnswer[]) => {
    setAppState(AppState.EVALUATING);
    setError(null);
    setUserAnswers(answers);
    clearExamState(); // Exam is finished, clear from storage
    if (!exam || !examConfig) {
        setError('Exam data is missing. Please restart.');
        setAppState(AppState.CONFIG);
        return;
    }
    try {
      const evaluationReport = await evaluateExam(exam, answers);
      setReport(evaluationReport);
      setAppState(AppState.REPORT);
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate the exam. Please try submitting again.');
      setAppState(AppState.EXAM); // Go back to exam screen on failure
    }
  }, [exam, examConfig]);

  const handleRestart = () => {
    clearExamState();
    setAppState(AppState.CONFIG);
    setExamConfig(null);
    setExam(null);
    setUserAnswers([]);
    setReport(null);
    setError(null);
    setInitialTimeLeft(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.CONFIG:
        return <ConfigScreen onStartExam={handleStartExam} error={error} />;
      case AppState.GENERATING:
        return <LoadingSpinner message="Generating your custom exam..." />;
      case AppState.EXAM:
        if (exam) {
          return <ExamScreen exam={exam} onSubmit={handleSubmitExam} initialAnswers={userAnswers} initialTimeLeft={initialTimeLeft} error={error} />;
        }
        return <LoadingSpinner message="Loading exam..." />;
      case AppState.EVALUATING:
        return <LoadingSpinner message="AI is evaluating your answers... This may take a moment for detailed feedback." />;
      case AppState.REPORT:
        if (report && exam) {
          return <ReportScreen report={report} exam={exam} userAnswers={userAnswers} onRestart={handleRestart} />;
        }
        return <LoadingSpinner message="Generating report..." />;
      default:
        return <ConfigScreen onStartExam={handleStartExam} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header onRestart={handleRestart} />
      <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;