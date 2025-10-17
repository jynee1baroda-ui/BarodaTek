import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Coding', path: '/coding' },
    { name: 'Tutorials', path: '/tutorials' },
    { name: 'Appeal', path: '/appeal' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-arena-black/95 backdrop-blur-md shadow-lg shadow-arena-red/20' : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with BarodaTek Llama Icon */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/assets/barodatek-logo.png" 
              alt="BarodaTek Llama" 
              className="w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-110"
            />
            <span className="text-xl md:text-2xl font-heading font-black glow-text-red">
              BARODATEK <span className="text-white">ARENA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-semibold text-sm uppercase tracking-wider transition-colors ${
                  location.pathname === link.path
                    ? 'text-arena-red'
                    : 'text-arena-gray hover:text-white'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-arena-red"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <button className="btn-arena-primary text-sm">
              JOIN NOW
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border-2 border-arena-red text-arena-red hover:bg-arena-red hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`font-semibold text-sm uppercase tracking-wider transition-colors ${
                    location.pathname === link.path
                      ? 'text-arena-red'
                      : 'text-arena-gray hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button className="btn-arena-primary text-sm w-full">
                JOIN NOW
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
