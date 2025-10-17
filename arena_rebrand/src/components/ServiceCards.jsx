import { motion } from 'framer-motion';

export default function ServiceCards() {
  const services = [
    {
      icon: '⚡',
      title: 'Lightning Fast API',
      description: 'High-performance endpoints built for speed and reliability. Handle millions of requests with zero downtime.',
    },
    {
      icon: '🔐',
      title: 'Secure by Default',
      description: 'Enterprise-grade security with JWT authentication, rate limiting, and encrypted data transmission.',
    },
    {
      icon: '📊',
      title: 'Real-Time Analytics',
      description: 'Monitor your API usage with live dashboards, detailed logs, and performance metrics.',
    },
    {
      icon: '🚀',
      title: 'Deploy Anywhere',
      description: 'One-click deployment to Vercel, Railway, or your own VPS. Docker-ready and cloud-native.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-20 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black mb-4">
            ARSENAL <span className="glow-text-red">FEATURES</span>
          </h2>
          <p className="text-lg text-arena-gray max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale your applications with confidence.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="arena-card group cursor-pointer"
            >
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {service.icon}
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white group-hover:text-arena-red transition-colors">
                {service.title}
              </h3>
              <p className="text-arena-gray text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
