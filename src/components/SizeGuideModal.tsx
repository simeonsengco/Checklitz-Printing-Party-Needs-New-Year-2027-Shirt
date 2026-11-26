import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { SIZE_GUIDE_ROWS } from '../data/products';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-xl bg-white dark:bg-[#121520] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2
                  id="size-guide-title"
                  className="font-display text-xl font-bold text-zinc-950 dark:text-white"
                >
                  Unisex T-Shirt Size Guide
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Standard Asian / Philippine unisex crewneck measurements (±0.5&quot; tolerance).
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close size guide"
                className="min-w-[38px] min-h-[38px] rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-950 hover:text-white dark:hover:bg-[#0D3BFF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 pr-3">Size</th>
                    <th className="py-2.5 px-3">Chest (in)</th>
                    <th className="py-2.5 px-3">Length (in)</th>
                    <th className="py-2.5 px-3">Shoulder</th>
                    <th className="py-2.5 pl-3">Chest / Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono tabular-nums text-xs sm:text-sm">
                  {SIZE_GUIDE_ROWS.map((row) => (
                    <tr
                      key={row.size}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <td className="py-2.5 pr-3 font-sans font-bold text-zinc-950 dark:text-white">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                        {row.chestIn}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                        {row.lengthIn}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                        {row.shoulderIn}
                      </td>
                      <td className="py-2.5 pl-3 text-zinc-500 dark:text-zinc-400">
                        {row.chestCm} / {row.lengthCm}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Fit Tip: For a relaxed streetwear drape, especially on our 2027 Club tees, consider sizing up one size.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
