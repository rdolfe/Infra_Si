export default function PropertyDetailLoading() {
  return (
    <div className="max-w-content mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-48 bg-stone-100 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full aspect-video bg-stone-100 rounded-xl" />
          <div className="h-8 w-2/3 bg-stone-100 rounded" />
          <div className="h-4 w-1/3 bg-stone-100 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-stone-100 rounded" />
            <div className="h-4 bg-stone-100 rounded" />
            <div className="h-4 w-3/4 bg-stone-100 rounded" />
          </div>
          <div className="bg-stone-50 rounded-xl p-6">
            <div className="h-5 w-32 bg-stone-100 rounded mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 bg-stone-100 rounded" />
                  <div className="h-4 w-12 bg-stone-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm space-y-4">
            <div className="h-9 w-36 bg-stone-100 rounded" />
            <div className="h-4 w-24 bg-stone-100 rounded" />
            <div className="h-12 bg-stone-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
