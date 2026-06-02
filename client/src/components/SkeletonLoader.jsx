const SkeletonLoader = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="surface-card rounded-3xl p-8">
        <div className="h-8 w-64 rounded-lg bg-white/10"></div>
        <div className="mt-4 h-4 w-96 rounded-lg bg-white/5"></div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="surface-card rounded-2xl h-[140px] p-6"
          >
            <div className="h-12 w-12 rounded-xl bg-white/10"></div>
            <div className="mt-8 h-4 w-24 rounded bg-white/10"></div>
            <div className="mt-3 h-8 w-20 rounded bg-white/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;