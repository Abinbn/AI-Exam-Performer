
export enum AppState {
  CONFIG = 'CONFIG',
  GENERATING = 'GENERATING',
  EXAM = 'EXAM',
  EVALUATING = 'EVALUATING',
  REVIEW = 'REVIEW', // Replaced REPORT with REVIEW
}

export interface ExamConfig {
  classLevel: string;
  subject: string;
  examType: string;
  duration: number;
  totalMarks: number;
}

export enum QuestionType {
  MCQ = 'mcq',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  marks: number;
  options?: { value: string; label: string }[];
}

export interface Exam {
  title: string;
  duration: number; // in minutes
  totalMarks: number;
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  answer: string;
}

export interface QuestionFeedback {
  questionId: number;
  questionText: string;
  studentAnswer: string;
  assignedScore: number;
  feedback: string;
}

export interface EvaluationReport {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: QuestionFeedback[];
}
