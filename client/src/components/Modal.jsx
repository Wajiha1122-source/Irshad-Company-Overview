import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { memo } from 'react';
import useRenderCounter from '../hooks/useRenderCounter';

const Modal = memo(({ isOpen, onClose, title, children }) => {
  const { isDark } = useTheme();
  useRenderCounter('Modal');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/62 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className={`
            surface-card relative mt-16 mb-8 max-h-[calc(100vh-8rem)] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-6 transform-gpu
            ${isDark ? 'text-slate-100' : 'text-slate-950'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="ghost-button h-10 w-10 shrink-0 p-0 text-slate-500 dark:text-slate-300"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default Modal;
