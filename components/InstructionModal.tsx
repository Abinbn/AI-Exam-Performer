
import React from 'react';

interface InstructionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">A Note Before You Begin</h2>
        <div className="text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p>This exam is a conversation between you and your future self. The effort you put in today builds the path you walk tomorrow.</p>
          <p><strong>Be Honest:</strong> The truest measure of success is integrity. Cheating might win you a mark, but it costs you character. Trust in your own preparation.</p>
          <p><strong>Embrace the Challenge:</strong> It's okay to feel nervous—it means you care. It's okay not to know everything—that's an opportunity to learn. This isn't just about getting answers right; it's about understanding how you think.</p>
          <p><strong>Focus:</strong> For these next moments, let this be your world. Quiet the noise, take a deep breath, and give it your best. You are more capable than you imagine.</p>
          <p>This is your moment. Make it count.</p>
        </div>
        <div className="mt-8 text-right">
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-150 ease-in-out active:scale-95"
          >
            I Understand, Begin Exam
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default InstructionModal;
