const PHASES = ['brainstorm', 'design', 'plan', 'execute', 'review', 'done'];

export function PhaseProgress({ current }: { current: string }) {
  const currentIndex = PHASES.indexOf(current);

  return (
    <div className="flex items-center gap-1 mb-8">
      {PHASES.map((phase, i) => {
        const allDone = current === 'done';
        const isComplete = allDone || i < currentIndex;
        const isCurrent = !allDone && i === currentIndex;
        return (
          <div key={phase} className="flex items-center gap-1 flex-1">
            <div className={`
              flex-1 h-2 rounded-full transition-colors
              ${isComplete ? 'bg-green-500' : ''}
              ${isCurrent ? 'bg-red-500 animate-pulse' : ''}
              ${!isComplete && !isCurrent ? 'bg-zinc-800' : ''}
            `} />
            <span className={`text-[10px] font-mono uppercase ${isCurrent ? 'text-red-400' : 'text-zinc-600'}`}>
              {phase}
            </span>
          </div>
        );
      })}
    </div>
  );
}
