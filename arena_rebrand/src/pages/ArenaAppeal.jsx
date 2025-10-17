import { motion } from 'framer-motion';

export default function ArenaAppeal() {
  const strengths = [
    {
      icon: '⚡',
      title: 'Blazing Fast',
      description: 'Sub-50ms response times on all endpoints. Your users deserve speed.',
    },
    {
      icon: '🛡️',
      title: 'Enterprise Ready',
      description: 'Bank-level security with SOC 2 compliance and 99.9% uptime SLA.',
    },
    {
      icon: '🎯',
      title: 'Developer First',
      description: 'Built by developers, for developers. Clean APIs, great docs, zero BS.',
    },
    {
      icon: '🚀',
      title: 'Scale Effortlessly',
      description: 'From prototype to millions of users. We grow with you, automatically.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="section-container">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6">
            THE <span className="glow-text-red">ARENA</span> DIFFERENCE
          </h1>
          <p className="text-2xl text-arena-gray max-w-4xl mx-auto leading-relaxed">
            We're not just another API platform. We're your competitive edge. 
            Your secret weapon. Your path to domination.
          </p>
        </motion.div>

        {/* Main Pitch */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="arena-card p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-6 text-center">
              WHY <span className="glow-text-red">CHAMPIONS</span> CHOOSE US
            </h2>
            
            <div className="space-y-6 text-lg text-arena-gray leading-relaxed">
              <p>
                Listen up. The development game has changed. You can't afford slow APIs, 
                unreliable infrastructure, or tools that fight against you. You need a platform 
                that <span className="text-white font-bold">moves at the speed of thought</span> and 
                scales at the speed of success.
              </p>
              
              <p>
                That's where we come in. <span className="glow-text-red font-bold">BARODATEK ARENA</span> isn't 
                just infrastructure – it's your competitive advantage. While your competitors are 
                debugging deployment issues, you're shipping features. While they're optimizing 
                response times, yours are already <span className="text-white font-bold">lightning fast</span>.
              </p>
              
              <p>
                We've built this platform on one simple principle: <span className="text-white font-bold">
                developers should spend time building, not configuring</span>. No complex setups. 
                No surprises. Just pure, unadulterated performance that lets you focus on what matters – 
                creating products your users will love.
              </p>
            </div>
          </div>
        </div>

        {/* Strengths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {strengths.map((strength, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="arena-card text-center group"
            >
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {strength.icon}
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 group-hover:text-arena-red transition-colors">
                {strength.title}
              </h3>
              <p className="text-arena-gray text-sm leading-relaxed">
                {strength.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* The Promise */}
        <div className="arena-card p-8 md:p-12 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-6">
            THE <span className="glow-text-red">GUARANTEE</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-5xl mb-3">⚡</div>
              <h3 className="text-2xl font-heading font-bold mb-2">Speed</h3>
              <p className="text-arena-gray">
                Sub-50ms responses or your money back. We're that confident.
              </p>
            </div>
            <div>
              <div className="text-5xl mb-3">🛡️</div>
              <h3 className="text-2xl font-heading font-bold mb-2">Security</h3>
              <p className="text-arena-gray">
                Enterprise-grade protection. Zero compromises on safety.
              </p>
            </div>
            <div>
              <div className="text-5xl mb-3">💪</div>
              <h3 className="text-2xl font-heading font-bold mb-2">Support</h3>
              <p className="text-arena-gray">
                Real humans, real solutions. 24/7 when you need us.
              </p>
            </div>
          </div>
          
          <p className="text-xl text-arena-gray mb-8">
            Try it free for 30 days. No credit card required. 
            If you're not absolutely convinced, we'll even help you migrate away. 
            <span className="text-white font-bold"> That's how sure we are.</span>
          </p>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-6">
            READY TO <span className="glow-text-red">DOMINATE</span>?
          </h2>
          <p className="text-xl text-arena-gray mb-8 max-w-2xl mx-auto">
            Join thousands of developers who've already leveled up their game. 
            The Arena is waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-arena-primary text-lg">
              START FREE TRIAL
            </button>
            <button className="btn-arena-secondary text-lg">
              SCHEDULE DEMO
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
