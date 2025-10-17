import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Coding Tools', path: '/coding' },
    { name: 'Tutorials', path: '/tutorials' },
    { name: 'About Arena', path: '/appeal' },
  ];

  return (
    <footer className="bg-arena-black border-t-2 border-arena-red mt-20">
      <div className="section-container py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand with Logo */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/assets/barodatek-logo.png" 
                alt="BarodaTek Llama" 
                className="w-10 h-10"
              />
              <span className="text-xl font-heading font-black glow-text-red">
                BARODATEK ARENA
              </span>
            </div>
            <p className="text-arena-gray text-sm leading-relaxed">
              Where Code Meets Competition. High-performance API platform with interactive games,
              developer tools, and professional training.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-arena-gray hover:text-arena-red transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-white">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-arena-dark-gray border-2 border-arena-mid-gray flex items-center justify-center hover:border-arena-red transition-colors group"
                aria-label="GitHub"
              >
                <span className="text-arena-gray group-hover:text-arena-red transition-colors">GH</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-arena-dark-gray border-2 border-arena-mid-gray flex items-center justify-center hover:border-arena-red transition-colors group"
                aria-label="Twitter"
              >
                <span className="text-arena-gray group-hover:text-arena-red transition-colors">TW</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-arena-dark-gray border-2 border-arena-mid-gray flex items-center justify-center hover:border-arena-red transition-colors group"
                aria-label="Discord"
              >
                <span className="text-arena-gray group-hover:text-arena-red transition-colors">DS</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-arena-mid-gray">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-arena-gray text-sm">
              © {currentYear} BARODATEK ARENA • Built for Champions
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-arena-gray hover:text-arena-red transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-arena-gray hover:text-arena-red transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-arena-gray hover:text-arena-red transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
