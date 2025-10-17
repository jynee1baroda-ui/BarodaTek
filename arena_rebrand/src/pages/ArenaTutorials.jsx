import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ArenaTutorials() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'api', 'deployment', 'security', 'performance'];

  const tutorials = [
    {
      id: 1,
      title: 'Building Your First REST API',
      category: 'api',
      type: 'video',
      duration: '15 min',
      level: 'Beginner',
      thumbnail: '🎬',
      description: 'Learn the fundamentals of RESTful API design and implementation.',
    },
    {
      id: 2,
      title: 'JWT Authentication Guide',
      category: 'security',
      type: 'article',
      duration: '10 min read',
      level: 'Intermediate',
      thumbnail: '📄',
      description: 'Secure your APIs with JSON Web Tokens and best practices.',
    },
    {
      id: 3,
      title: 'Deploy to Vercel in 5 Minutes',
      category: 'deployment',
      type: 'video',
      duration: '5 min',
      level: 'Beginner',
      thumbnail: '🎬',
      description: 'Step-by-step guide to deploying your app on Vercel.',
    },
    {
      id: 4,
      title: 'API Performance Optimization',
      category: 'performance',
      type: 'article',
      duration: '12 min read',
      level: 'Advanced',
      thumbnail: '📄',
      description: 'Advanced techniques for optimizing API response times.',
    },
    {
      id: 5,
      title: 'Rate Limiting & Throttling',
      category: 'security',
      type: 'video',
      duration: '18 min',
      level: 'Intermediate',
      thumbnail: '🎬',
      description: 'Protect your API from abuse with rate limiting strategies.',
    },
    {
      id: 6,
      title: 'Docker Deployment Guide',
      category: 'deployment',
      type: 'article',
      duration: '20 min read',
      level: 'Advanced',
      thumbnail: '📄',
      description: 'Containerize and deploy your applications with Docker.',
    },
  ];

  const filteredTutorials = activeCategory === 'all'
    ? tutorials
    : tutorials.filter(t => t.category === activeCategory);

  const getLevelColor = (level) => {
    const colors = {
      Beginner: 'text-green-500',
      Intermediate: 'text-yellow-500',
      Advanced: 'text-red-500',
    };
    return colors[level] || 'text-arena-gray';
  };

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
            ARENA <span className="glow-text-red">TUTORIALS</span>
          </h1>
          <p className="text-xl text-arena-gray max-w-3xl mx-auto">
            Master modern development with our comprehensive video and article library. 
            From beginner basics to advanced techniques.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-arena-red text-white'
                  : 'bg-arena-dark-gray text-arena-gray border-2 border-arena-mid-gray hover:border-arena-red'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tutorials Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="arena-card group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-full h-40 bg-arena-black rounded-lg flex items-center justify-center mb-4 text-6xl">
                {tutorial.thumbnail}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-3 mb-3 text-xs">
                <span className={getLevelColor(tutorial.level)}>
                  ● {tutorial.level}
                </span>
                <span className="text-arena-gray">{tutorial.type}</span>
                <span className="text-arena-gray">{tutorial.duration}</span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-arena-red transition-colors">
                {tutorial.title}
              </h3>

              {/* Description */}
              <p className="text-arena-gray text-sm mb-4 leading-relaxed">
                {tutorial.description}
              </p>

              {/* Button */}
              <button className="btn-arena-secondary text-sm w-full">
                {tutorial.type === 'video' ? 'WATCH NOW' : 'READ ARTICLE'}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center arena-card p-8"
        >
          <h3 className="text-2xl font-heading font-bold mb-4">
            Want <span className="glow-text-red">Custom Training</span>?
          </h3>
          <p className="text-arena-gray mb-6">
            Need personalized tutorials or team training? Contact us for custom content creation.
          </p>
          <button className="btn-arena-primary">
            REQUEST CUSTOM TRAINING
          </button>
        </motion.div>
      </div>
    </div>
  );
}
