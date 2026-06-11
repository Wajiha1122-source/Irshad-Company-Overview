import { memo } from 'react';

const GlassCard = memo(({ children, className = '', hover = true, onClick }) => {
  const hoverClasses = hover
    ? 'cursor-pointer transition-[border-color,box-shadow,background-color] duration-150 hover:border-slate-500 hover:bg-slate-800'
    : '';

  return (
    <div
      className={`surface-card relative overflow-hidden rounded-2xl p-6 text-slate-100 ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

export default GlassCard;
