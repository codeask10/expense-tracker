import { useEffect, useRef, useState, ReactNode } from 'react';

type Phase = 'hidden' | 'entering' | 'visible' | 'leaving';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }: ModalProps) {
  const [phase, setPhase] = useState<Phase>('hidden');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (isOpen) {
      setPhase('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('visible')));
    } else {
      if (phase !== 'hidden') {
        setPhase('leaving');
        timerRef.current = setTimeout(() => setPhase('hidden'), 240);
      }
    }
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (phase === 'hidden') return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, onClose]);

  useEffect(() => {
    document.body.style.overflow = phase !== 'hidden' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  if (phase === 'hidden') return null;
  const isIn = phase === 'visible';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${isIn ? 'modal-backdrop-in' : 'modal-backdrop-out'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl ${isIn ? 'modal-panel-in' : 'modal-panel-out'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          <button onClick={onClose} className="ml-4 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
