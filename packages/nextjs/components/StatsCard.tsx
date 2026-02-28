export const StatsCard = ({ title, value, icon: Icon, color = "primary" }: any) => {
  return (
    <div className={`stat bg-base-100 shadow px-6 py-4 rounded-3xl border-l-4 border-${color}`}>
      <div className={`stat-figure text-${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="stat-title font-semibold">{title}</div>
      <div className={`stat-value text-xl md:text-3xl text-${color}`}>{value}</div>
      <div className="stat-desc mt-1 opacity-70">Updated just now</div>
    </div>
  );
};
