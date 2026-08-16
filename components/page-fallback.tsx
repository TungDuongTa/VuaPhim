export function PageFallback({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex min-h-[50vh] items-center justify-center ${className}`.trim()}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
