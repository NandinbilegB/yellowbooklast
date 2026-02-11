export function CategoryFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-9 bg-gray-300 rounded-md w-24 animate-pulse"></div>
      ))}
    </div>
  );
}
