import { motion } from 'framer-motion';

export default function ArenaGames() {
  const games = [
    {
      id: 1,
      icon: '🌌',
      title: 'API Galaxy Explorer',
      level: '15 Levels',
      difficulty: 'Beginner → Advanced',
      description: 'Master API concepts through interactive challenges. From REST basics to advanced authentication patterns.',
      features: ['HTTP Methods', 'Status Codes', 'Headers & Auth', 'Error Handling'],
      status: 'available',
    },
    {
      id: 2,
      icon: '⚔️',
      title: 'Syntax Arena',
      level: '20 Rounds',
      difficulty: 'Intermediate',
      description: 'Battle syntax errors in real-time. Speed and accuracy are your weapons in this fast-paced coding challenge.',
      features: ['Real-time Debugging', 'Timed Challenges', 'Leaderboards', 'Multiplayer'],
      status: 'coming-soon',
    },
    {
      id: 3,
      icon: '🎯',
      title: 'Code Combat',
      level: '30 Missions',
      difficulty: 'Advanced',
      description: 'Solve algorithmic puzzles under pressure. Compete for the fastest and most elegant solutions.',
      features: ['Algorithm Challenges', 'Performance Testing', 'Code Golf', 'Tournament Mode'],
      status: 'coming-soon',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6">
            ARENA <span className="glow-text-red">GAMES</span>
          </h1>
          <p className="text-xl text-arena-gray max-w-3xl mx-auto">
            Level up your coding skills through interactive challenges and competitive gameplay.
            Choose your arena and prove your worth.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="arena-card cursor-pointer group relative"
            >
              {/* Status Badge */}
              {game.status === 'coming-soon' && (
                <div className="absolute top-4 right-4 bg-arena-red px-3 py-1 rounded-full text-xs font-bold">
                  COMING SOON
                </div>
              )}

              {/* Icon */}
              <div className="text-7xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {game.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-heading font-bold mb-2 group-hover:text-arena-red transition-colors">
                {game.title}
              </h3>

              {/* Level & Difficulty */}
              <div className="flex items-center gap-4 mb-4 text-sm text-arena-gray">
                <span>📊 {game.level}</span>
                <span>•</span>
                <span>🎚️ {game.difficulty}</span>
              </div>

              {/* Description */}
              <p className="text-arena-gray mb-6 leading-relaxed">
                {game.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {game.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <span className="text-arena-red mr-2">✓</span>
                    <span className="text-arena-gray">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                disabled={game.status === 'coming-soon'}
                className={`w-full ${
                  game.status === 'available'
                    ? 'btn-arena-primary'
                    : 'bg-arena-mid-gray text-arena-gray cursor-not-allowed px-6 py-3 rounded-lg font-bold'
                }`}
              >
                {game.status === 'available' ? 'PLAY NOW' : 'COMING SOON'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center arena-card p-8"
        >
          <h3 className="text-2xl font-heading font-bold mb-4">
            Ready to <span className="glow-text-red">Dominate</span>?
          </h3>
          <p className="text-arena-gray mb-6">
            Track your progress, compete on leaderboards, and earn achievements as you conquer each arena.
          </p>
          <button className="btn-arena-primary">
            CREATE FREE ACCOUNT
          </button>
        </motion.div>
      </div>
    </div>
  );
}
