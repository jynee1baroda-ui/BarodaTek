import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Full Stack Developer',
      company: 'Tech Corp',
      text: 'This platform transformed how I approach API development. The games made learning actually fun!',
      avatar: '👨‍💻',
    },
    {
      name: 'Sarah Johnson',
      role: 'DevOps Engineer',
      company: 'Cloud Solutions',
      text: 'Best developer experience I\'ve ever had. Fast, reliable, and the Arena theme is incredibly motivating.',
      avatar: '👩‍💻',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Software Architect',
      company: 'Innovation Labs',
      text: 'The tutorials and interactive games helped our entire team level up their API skills in weeks.',
      avatar: '🧑‍💻',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
            CHAMPION <span className="glow-text-red">VOICES</span>
          </h2>
          <p className="text-lg text-arena-gray max-w-2xl mx-auto">
            Hear from developers who conquered the Arena and leveled up their skills.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="arena-card text-center p-8 md:p-12"
              >
                <div className="text-6xl mb-6">{testimonials[currentIndex].avatar}</div>
                <p className="text-lg md:text-xl text-arena-gray italic mb-6 leading-relaxed">
                  "{testimonials[currentIndex].text}"
                </p>
                <div className="border-t border-arena-mid-gray pt-6">
                  <h4 className="text-xl font-heading font-bold text-arena-red mb-1">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-arena-gray text-sm">
                    {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-arena-red w-8'
                    : 'bg-arena-mid-gray hover:bg-arena-gray'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
