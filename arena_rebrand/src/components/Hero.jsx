import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-arena-bg/50 to-arena-bg" />

      {/* Content */}
      <div className="relative z-10 section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <motion.div
            className="text-8xl md:text-9xl mb-6"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🏟️
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-heading font-black mb-6 glow-text-red animate-pulse-glow">
            ENTER THE ARENA
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl md:text-3xl text-arena-gray mb-10 max-w-3xl mx-auto font-medium">
            Where Code Meets Competition
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/games" className="btn-arena-primary text-lg w-full sm:w-auto">
              JOIN NOW
            </Link>
            <Link to="/tutorials" className="btn-arena-secondary text-lg w-full sm:w-auto">
              LEARN MORE
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div>
              <div className="text-3xl md:text-4xl font-heading font-black glow-text-red">
                99.9%
              </div>
              <div className="text-sm text-arena-gray mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-heading font-black glow-text-red">
                &lt;50ms
              </div>
              <div className="text-sm text-arena-gray mt-1">Response</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-heading font-black glow-text-red">
                24/7
              </div>
              <div className="text-sm text-arena-gray mt-1">Support</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-arena-red flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-arena-red rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
