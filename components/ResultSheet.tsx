
import React, { useState, useRef, useEffect } from 'react';
import { EvaluationReport, Exam } from '../types';

interface ResultSheetProps {
  report: EvaluationReport;
  exam: Exam;
  onRestart: () => void;
}

const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return 'text-slate-600 bg-slate-100';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
};

const ListItem: React.FC<{ children: React.ReactNode, icon: React.ReactElement }> = ({ children, icon }) => (
    <li className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">{icon}</div>
        <span className="text-slate-700">{children}</span>
    </li>
);

const ResultSheet: React.FC<ResultSheetProps> = ({ report, exam, onRestart }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{ y: number; height: number } | null>(null);

    const toggleSheet = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        const sheet = sheetRef.current;
        if (sheet) {
            sheet.style.transition = 'transform 0.3s ease-in-out';
            if (isExpanded) {
                sheet.style.transform = `translateY(0%)`;
            } else {
                sheet.style.transform = `translateY(calc(100% - 80px))`;
            }
        }
    }, [isExpanded]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!sheetRef.current) return;
        dragStartRef.current = { y: e.clientY, height: sheetRef.current.offsetHeight };
        sheetRef.current.style.transition = 'none';
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStartRef.current || !sheetRef.current) return;
        const deltaY = e.clientY - dragStartRef.current.y;
        const newTransform = `calc(100% - 80px + ${deltaY}px)`;
        
        // Clamp the movement
        const minTransform = 0; // Fully open
        const maxTransform = sheetRef.current.offsetHeight - 80; // Fully closed
        const currentY = sheetRef.current.offsetHeight - 80 + deltaY;

        if (currentY >= minTransform && currentY <= maxTransform) {
            sheetRef.current.style.transform = `translateY(${newTransform})`;
        }
    };
    
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStartRef.current || !sheetRef.current) return;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        const deltaY = e.clientY - dragStartRef.current.y;
        dragStartRef.current = null;
        
        if (Math.abs(deltaY) > 50) { // Threshold to decide action
            setIsExpanded(deltaY < 0); // Dragged up
        } else {
            // Snap back
            setIsExpanded(isExpanded);
        }
    };


    return (
        <div 
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-20 max-w-4xl mx-auto"
            style={{ transform: `translateY(calc(100% - 80px))`, touchAction: 'none' }}
        >
            <div 
                className="bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => { if(e.target === e.currentTarget) toggleSheet() }}
            >
                <div className="h-20 flex justify-between items-center px-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-500">Your Result</span>
                        <h2 className="text-xl font-bold text-slate-800">Exam Performance Summary</h2>
                    </div>
                     <div className={`font-bold text-2xl py-2 px-4 rounded-full ${getScoreColor(report.overallScore, exam.totalMarks)}`}>
                        {report.overallScore}<span className="text-lg text-slate-500">/{exam.totalMarks}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 p-6 h-[calc(100vh-80px)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-8 pb-24">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-green-700 mb-4">Strengths</h3>
                            <ul className="space-y-3">
                                {report.strengths.map((item, i) => 
                                    <ListItem key={i} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}>{item}</ListItem>
                                )}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-yellow-700 mb-4">Areas for Improvement</h3>
                            <ul className="space-y-3">
                                {report.weaknesses.map((item, i) => 
                                    <ListItem key={i} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}>{item}</ListItem>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4">AI Recommendations</h3>
                        <ul className="space-y-3">
                            {report.recommendations.map((item, i) => 
                                <ListItem key={i} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>}>{item}</ListItem>
                            )}
                        </ul>
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
            </div>
        </div>
    );
};

export default ResultSheet;
