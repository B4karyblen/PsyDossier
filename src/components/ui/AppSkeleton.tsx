import React from 'react';

const Bar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-md bg-ink-150 animate-pulse ${className}`} />
);

/** Loading state shaped like the workspace (PRD B4: « chargement (squelette) »). */
export const AppSkeleton: React.FC = () => (
  <div className="min-h-screen bg-canvas flex" role="status" aria-busy="true" aria-label="Chargement des dossiers">
    <span className="sr-only">Chargement des dossiers…</span>
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white border-r border-ink-150">
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-ink-150">
        <div className="w-8 h-8 rounded-lg bg-brand-500" />
        <Bar className="h-4 w-28" />
      </div>
      <div className="p-3 space-y-3">
        <Bar className="h-10 w-full" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Bar key={i} className="h-9 w-full" />
        ))}
      </div>
    </aside>
    <div className="flex-1 min-w-0">
      <div className="h-16 bg-white border-b border-ink-150 px-8 flex items-center justify-between">
        <Bar className="h-4 w-48" />
        <Bar className="h-10 w-72 hidden md:block" />
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <Bar className="h-4 w-32" />
          <Bar className="h-7 w-72" />
        </div>
        <div className="clinical-card grid grid-cols-2 xl:grid-cols-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="p-6 space-y-3 border-ink-150 [&:not(:first-child)]:border-l">
              <Bar className="h-4 w-32" />
              <Bar className="h-8 w-16" />
              <Bar className="h-3 w-40" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="clinical-card p-5 space-y-4">
              <Bar className="h-5 w-48" />
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-150 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <Bar className="h-4 w-1/2" />
                    <Bar className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
