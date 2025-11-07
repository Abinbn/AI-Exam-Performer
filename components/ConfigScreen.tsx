
import React, { useState } from 'react';
import { ExamConfig } from '../types';
import { CLASS_LEVELS, SUBJECTS, EXAM_TYPES, DURATIONS, TOTAL_MARKS } from '../constants';
import InstructionModal from './InstructionModal';

interface ConfigScreenProps {
  onStartExam: (config: ExamConfig) => void;
  error?: string | null;
}

const Chip: React.FC<{ label: string; isSelected: boolean; onClick: () => void }> = ({ label, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out border ${
            isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
        }`}
    >
        {label}
    </button>
);

interface ChipGroupProps<T extends string | number> {
  title: string;
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  renderLabel?: (value: T) => string;
}

const ChipGroup = <T extends string | number>({ title, options, selectedValue, onSelect, renderLabel }: ChipGroupProps<T>) => (
    <div className="space-y-3">
        <h3 className="block text-base font-medium text-slate-700">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <Chip
                    key={String(opt)}
                    label={renderLabel ? renderLabel(opt) : String(opt)}
                    isSelected={selectedValue === opt}
                    onClick={() => onSelect(opt)}
                />
            ))}
        </div>
    </div>
);


const ConfigScreen: React.FC<ConfigScreenProps> = ({ onStartExam, error }) => {
  const [classLevel, setClassLevel] = useState(CLASS_LEVELS[2]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [duration, setDuration] = useState(DURATIONS[3]);
  const [totalMarks, setTotalMarks] = useState(TOTAL_MARKS[3]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<ExamConfig | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { classLevel, subject, examType, duration, totalMarks };
    setPendingConfig(config);
    setIsModalOpen(true);
  };

  const handleConfirmStart = () => {
    if (pendingConfig) {
      onStartExam(pendingConfig);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <InstructionModal isOpen={isModalOpen} onConfirm={handleConfirmStart} />
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-1 text-slate-800">Create Your Exam</h2>
        <p className="text-slate-600 mb-6">Let our AI craft a personalized test just for you.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <ChipGroup title="Class / Grade" options={CLASS_LEVELS} selectedValue={classLevel} onSelect={setClassLevel} />
          <ChipGroup title="Subject" options={SUBJECTS} selectedValue={subject} onSelect={setSubject} />
          <ChipGroup title="Exam Type" options={EXAM_TYPES} selectedValue={examType} onSelect={setExamType} />
          
          <div className="pt-2 space-y-6">
             <ChipGroup 
                title="Duration" 
                options={DURATIONS} 
                selectedValue={duration} 
                onSelect={setDuration}
                renderLabel={(d) => `${d} minutes`}
             />
             <ChipGroup 
                title="Total Marks" 
                options={TOTAL_MARKS} 
                selectedValue={totalMarks} 
                onSelect={setTotalMarks}
                renderLabel={(m) => `${m} marks`}
             />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-150 ease-in-out active:scale-95">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11.983 1.907a.75.75 0 00-1.292-.75L3 10.25l7.691 9.093a.75.75 0 101.292-.75L5.755 10.25l6.228-7.593zM14.5 1.157a.75.75 0 011.292.75L9.564 10.25l6.228 7.593a.75.75 0 01-1.292.75L8.272 10.25l6.228-9.093z" />
               </svg>
              <span>Generate Exam</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ConfigScreen;
