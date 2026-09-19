// ─── BookCard skeleton ────────────────────────────────────────────────────────
export const BookCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-[#1E1E1E] border border-gray-800 animate-pulse">
    <div className="h-52 bg-gray-800" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-800 rounded w-1/2" />
      <div className="h-3 bg-gray-800 rounded w-1/3 mt-1" />
    </div>
    <div className="px-3 pb-3 flex gap-2">
      <div className="flex-1 h-8 bg-gray-800 rounded-xl" />
      <div className="w-9 h-8 bg-gray-800 rounded-xl" />
    </div>
  </div>
);

// ─── BookGrid skeleton ────────────────────────────────────────────────────────
export const BookGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

// ─── Recommended skeleton (6 cols) ───────────────────────────────────────────
export const RecommendedSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);