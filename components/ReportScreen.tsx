import React from 'react';
import { EvaluationReport, Exam, UserAnswer, QuestionType } from '../types';

interface ReportScreenProps {
  report: EvaluationReport;
  exam: Exam;
  userAnswers: UserAnswer[];
  onRestart: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ report, exam, userAnswers, onRestart }) => {
    
    const getScoreColor = (score: number, maxScore: number) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'text-green-600 bg-green-100';
        if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    // Fix: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
    const ListItem: React.FC<{ children: React.ReactNode, icon: React.ReactElement }> = ({ children, icon }) => (
        <li className="flex items-start space-x-3">
            <div className="flex-shrink-0 pt-1">{icon}</div>
            <span className="text-slate-700">{children}</span>
        </li>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Exam Report</h2>
                <p className="text-slate-600">Here's the AI-powered analysis of your performance.</p>
                <div className={`mt-6 inline-block font-bold text-5xl py-4 px-6 rounded-full ${getScoreColor(report.overallScore, exam.totalMarks)}`}>
                    {report.overallScore}
                    <span className="text-2xl text-slate-500"> / {exam.totalMarks}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2H5.5" /></svg>
                        Strengths
                    </h3>
                    <ul className="space-y-3">
                        {report.strengths.map((item, i) => 
                            <ListItem key={i} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}>{item}</ListItem>
                        )}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                        {report.weaknesses.map((item, i) => 
                            <ListItem key={i} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}>{item}</ListItem>
                        )}
                    </ul>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    AI Recommendations
                </h3>
                <ul className="space-y-3">
                    {report.recommendations.map((item, i) => 
                        <ListItem key={i} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>}>{item}</ListItem>
                    )}
                </ul>
            </div>
            
            <div>
                <h3 className="text-2xl font-bold text-slate-800 my-6 text-center">Detailed Answer Breakdown</h3>
                <div className="space-y-6">
                    {report.detailedFeedback.map((fb, index) => {
                        const question = exam.questions.find(q => q.id === fb.questionId)!;
                        return (
                            <div key={fb.questionId} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-start border-b pb-3 mb-4">
                                    <p className="text-lg font-semibold text-slate-800">Q{index + 1}: {fb.questionText}</p>
                                    <span className={`ml-4 flex-shrink-0 text-md font-bold px-3 py-1 rounded-full ${getScoreColor(fb.assignedScore, question.marks)}`}>
                                        {fb.assignedScore} / {question.marks}
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-slate-600">Your Answer:</h4>
                                        <p className="text-slate-700 p-3 bg-slate-50 rounded-md mt-1 whitespace-pre-wrap">{fb.studentAnswer || "Not Answered"}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-600">AI Feedback:</h4>
                                        <p className="text-slate-700 p-3 bg-blue-50 rounded-md mt-1">{fb.feedback}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center pt-4">
                <button
                    onClick={onRestart}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-150 ease-in-out active:scale-95"
                >
                    Take Another Exam
                </button>
            </div>
        </div>
    );
};

export default ReportScreen;