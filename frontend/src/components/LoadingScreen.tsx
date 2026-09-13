import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  modeName?: string;
  onFinish?: () => void;
}

export function LoadingScreen({ modeName, onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(10);
  const [show, setShow] = useState(true);

  // Smooth realistic progression while WebGL & telemetry initialize
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds smooth circular sweep

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic curve
      const eased = 1 - Math.pow(1 - t, 3);
      const currentPct = Math.min(100, Math.round(10 + 90 * eased));
      
      setProgress(currentPct);

      if (t >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setShow(false);
          onFinish?.();
        }, 350);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish]);

  // Circular SVG calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.02
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="circular-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            pointerEvents: 'all',
          }}
        >
          {/* Circular Loader */}
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Outer Slow Rotating Dashed Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: '1px dashed rgba(255, 255, 255, 0.18)',
                pointerEvents: 'none',
              }}
            />

            {/* Inner Glow Pulse */}
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* SVG Progress Circle */}
            <svg width="130" height="130" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="3.5"
                fill="none"
              />
              {/* Active Indicator */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{
                  transition: 'stroke-dashoffset 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))',
                }}
              />
            </svg>

            {/* Centered Percentage Text */}
            <div style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}>
              <span style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Mode Title */}
          {modeName && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ffffff' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {modeName}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
