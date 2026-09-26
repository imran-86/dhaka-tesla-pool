export function FareCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Route skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-slate-800 rounded"></div>
        <div className="h-3 w-3 bg-slate-800 rounded"></div>
        <div className="h-4 w-16 bg-slate-800 rounded"></div>
        <div className="h-3 w-20 bg-slate-800 rounded"></div>
      </div>

      {/* Line items skeleton */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-slate-800 rounded"></div>
          <div className="h-3 w-12 bg-slate-800 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-32 bg-slate-800 rounded"></div>
          <div className="h-3 w-12 bg-slate-800 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-slate-800 rounded"></div>
          <div className="h-3 w-12 bg-slate-800 rounded"></div>
        </div>
      </div>

      {/* Total skeleton */}
      <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-3 w-20 bg-slate-800 rounded"></div>
          <div className="h-2 w-28 bg-slate-800 rounded"></div>
        </div>
        <div className="h-6 w-16 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
}