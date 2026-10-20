import React from 'react';

interface LoadingStateProps {
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col"
        >
          <div className="aspect-video bg-slate-800/60 w-full" />
          <div className="p-3.5 space-y-2.5">
            <div className="h-3 bg-slate-800/80 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-4/5" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            <div className="pt-2 border-t border-slate-800/80 flex justify-between">
              <div className="h-6 bg-slate-800/80 rounded w-1/3" />
              <div className="h-6 bg-slate-800/80 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
