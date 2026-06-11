import { memo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = memo(({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl'
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/90 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`surface-card relative my-8 max-h-[calc(100vh-4rem)] w-full ${sizeClasses[size]} overflow-y-auto rounded-2xl p-5 text-slate-100 sm:p-6`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="ghost-button h-10 w-10 shrink-0 p-0 text-slate-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
});

export default Modal;
