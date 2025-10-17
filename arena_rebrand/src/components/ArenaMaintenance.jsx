import { motion } from 'framer-motion';

export default function ArenaMaintenance({ patch }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-4 relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Arena systems are currently offline for maintenance"
    >
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, rgba(255,0,51,0.1) 0px, transparent 2px, transparent 4px, rgba(255,0,51,0.1) 4px)',
          animation: 'scanline 8s linear infinite'
        }}></div>
      </div>

      {/* Glitch Effect */}
      <motion.div
        animate={{
          x: [0, -2, 2, -2, 0],
          opacity: [1, 0.8, 1, 0.9, 1]
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3
        }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-arena-red mb-4 glow-text-red">
          ⚠️ ARENA SYSTEMS OFFLINE
        </h1>
        <div className="h-1 w-64 bg-arena-red mx-auto mb-8 animate-pulse"></div>
      </motion.div>

      <div className="space-y-4 text-lg md:text-xl text-gray-300 relative z-10">
        <p>
          <span className="text-arena-red font-bold">Version:</span>{' '}
          {patch?.version || 'N/A'}
        </p>
        <p>
          <span className="text-arena-red font-bold">Patch:</span>{' '}
          {patch?.description || 'System maintenance in progress...'}
        </p>
        <p>
          <span className="text-arena-red font-bold">ETA:</span>{' '}
          {patch?.eta || 'TBD'}
        </p>
      </div>

      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-12 text-2xl text-arena-red font-bold relative z-10"
      >
        🔄 RECONNECTING...
      </motion.div>

      <p className="mt-8 text-gray-400 text-sm relative z-10">
        The Arena will return stronger. Stand by, Champion.
      </p>

      <style jsx>{`
        @keyframes scanline {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </motion.div>
  );
}
