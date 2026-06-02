import { motion } from 'framer-motion';
import { memo } from 'react';
import useRenderCounter from '../hooks/useRenderCounter';

const StatCard = memo(({ title, value, icon: Icon, color, onClick }) => {
  useRenderCounter('StatCard');
  const colorClasses = {
    blue: 'from-blue-600 to-sky-500 text-white',
    purple: 'from-indigo-600 to-violet-500 text-white',
    green: 'from-emerald-600 to-teal-500 text-white',
    orange: 'from-amber-500 to-orange-500 text-white',
    red: 'from-rose-600 to-red-500 text-white',
    pink: 'from-fuchsia-600 to-pink-500 text-white',
  };

  const accent = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.995 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`
surface-card group relative h-[140px] overflow-hidden rounded-3xl p-6 contain-layout style paint text-slate-950 dark:text-white
        cursor-pointer transition-transform duration-300
        hover:shadow-2xl dark:hover:shadow-black/30
        transform-gpu
      `}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className={`rounded-2xl bg-gradient-to-br p-3 shadow-sm ${accent}`}>
            <Icon size={22} />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
          <p className="mt-2 break-words text-[36px] font-bold leading-none tracking-normal">{value}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default StatCard;
