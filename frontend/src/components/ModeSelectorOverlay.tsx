import { motion, AnimatePresence } from 'framer-motion';
import MotionButton from './ui/motion-button';

interface ModeSelectorOverlayProps {
  isOpen: boolean;
  onSelectMode: (mode: 'demo' | 'live', label: string) => void;
}

export function ModeSelectorOverlay({ isOpen, onSelectMode }: ModeSelectorOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mode-selector-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99990] flex flex-col items-center justify-center bg-black px-4 text-white select-none"
        >
          <div className="flex flex-col items-center text-center space-y-10">
            {/* ONLY ONE HEADING */}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-['Space_Grotesk']">
              Select Mode
            </h1>

            {/* The Two Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <MotionButton
                label="2024 Full Year Coverage"
                classes="w-80 bg-zinc-950 border border-white/20 hover:border-white transition-all shadow-xl"
                onClick={() => onSelectMode('demo', '2024 Full Year Coverage')}
              />
              <MotionButton
                label="Live Mode"
                classes="w-80 bg-zinc-950 border border-white/20 hover:border-white transition-all shadow-xl"
                onClick={() => onSelectMode('live', 'Live Mode')}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
