// Shown while the published events load from the repository boundary.
export default function UpcomingEventsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-muted motion-reduce:animate-none" />
      <div className="h-24 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
