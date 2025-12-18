export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm fixed inset-0 z-50">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-500/50 animate-spin blur-md" />
      </div>
    </div>
  );
}
