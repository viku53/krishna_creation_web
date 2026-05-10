import React, { useEffect } from 'react';


interface MediaModalProps {
  open: boolean;
  src: string;
  type: 'image' | 'video';
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  caption?: string;
}

const MediaModal: React.FC<MediaModalProps> = ({ open, src, type, onClose, onPrev, onNext, caption }) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      {/* Close */}
      <button className="modal-close" onClick={onClose} aria-label="Close">
        X
      </button>

      {/* Prev */}
      {onPrev && (
        <button className="modal-nav modal-nav--prev" onClick={e => { e.stopPropagation(); onPrev(); }} aria-label="Previous">
          <span>{'<'}</span>
        </button>
      )}

      {/* Next */}
      {onNext && (
        <button className="modal-nav modal-nav--next" onClick={e => { e.stopPropagation(); onNext(); }} aria-label="Next">
          <span>{'>'}</span>
        </button>
      )
      }

      {/* Content */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {type === 'image' ? (
          <img src={src} alt={caption || 'Photo'} />
        ) : (
          <video src={src} controls autoPlay />
        )}
        {caption && <div className="modal-caption">{caption}</div>}
      </div>
    </div >
  );
};

export default MediaModal;
