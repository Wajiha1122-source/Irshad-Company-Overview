import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { memo } from 'react';
import useRenderCounter from '../hooks/useRenderCounter';

const GlassCard = memo(({ children, className = '', hover = true, onClick }) => {
  const { isDark } = useTheme();
  useRenderCounter('GlassCard');

  const baseClasses = `
    surface-card relative overflow-hidden rounded-2xl p-6 contain-layout style paint
    ${isDark ? 'text-slate-100' : 'text-slate-950'}
  `;

  const hoverClasses = hover
    ? 'cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/10 dark:hover:shadow-black/30'
    : '';

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      whileTap={hover ? { scale: 0.995 } : {}}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className={`${baseClasses} ${hoverClasses} ${className} transform-gpu`}
      onClick={onClick}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
      {children}
    </motion.div>
  );
});

export default GlassCard;
