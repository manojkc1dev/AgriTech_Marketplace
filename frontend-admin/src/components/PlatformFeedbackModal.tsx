import React from 'react';
import { X, MessageSquare, Star, CheckCircle } from 'lucide-react';
import { PlatformFeedbackItem } from '../types';

interface PlatformFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackItems: PlatformFeedbackItem[];
  onToggleResolve: (id: string) => void;
}

export const PlatformFeedbackModal: React.FC<PlatformFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedbackItems,
  onToggleResolve
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">Platform User Feedback</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Direct reports from regional market supervisors & co-op leads</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {feedbackItems.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-stone-900 dark:text-white">{fb.userName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium">
                    {fb.userRole}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'}`} />
                  ))}
                </div>
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">{fb.message}</p>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] text-stone-500">
                <span>Category: <strong className="text-stone-700 dark:text-stone-300">{fb.category}</strong> • {fb.date}</span>
                <button
                  onClick={() => onToggleResolve(fb.id)}
                  className={`flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    fb.resolved 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : 'bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  {fb.resolved ? 'Resolved' : 'Mark as Resolved'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
