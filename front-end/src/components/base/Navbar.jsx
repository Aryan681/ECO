import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // GSAP animations with developer aesthetic
    gsap.fromTo('.nav-item', 
      { y: -20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.5, 
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3
      }
    );

    // Animate the logo with a "typing" effect
    gsap.to(".logo-cursor", {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.8
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  // Developer-focused navigation
  const navLinks = [
    { text: 'features()', path: '/#features' },
    { text: 'docs', path: '/docs' },
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'pricing', path: '/pricing' }
  ];
  
  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-gray-950/95 backdrop-blur-md border-gray-800 py-4' 
          : 'bg-gray-950/80 border-transparent py-7'
      }`}
    >
      <div className="container mx-auto px-3">
        <div className="flex justify-between items-center">
          {/* Logo with terminal style */}
          <Link to="/" className="flex items-center group">
            <span className="font-mono text-xl text-cyan-400 mr-1">$</span>
            <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition duration-300">
              eco
              <span className="logo-cursor">_</span>
            </span>
          </Link>
          
          {/* Desktop Navigation - Terminal style */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.path}
                className={`nav-item font-mono text-sm ${
                  location.pathname === link.path 
                    ? 'text-cyan-400 border-b border-cyan-400' 
                    : 'text-gray-400 hover:text-white'
                } transition duration-300`}
              >
                {link.text}
              </Link>
            ))}
          </nav>
          
          {/* Auth Buttons - CLI style */}
          <div className="hidden md:flex items-center space-x-3">
            <Link 
              to="/auth/login"
              className="nav-item font-mono text-sm text-gray-400 hover:text-white px-3 py-1 border border-gray-700 hover:border-gray-600 rounded transition duration-300"
            >
              login
            </Link>
            <Link 
              to="/auth/register"
              className="nav-item font-mono text-sm bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-900 px-3 py-1 rounded transition duration-300"
            >
              npm start
            </Link>
          </div>
          
          {/* Mobile Menu Button - Hamburger as {} */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white focus:outline-none font-mono"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <span className="text-cyan-400">&#x2715;</span> // Close icon
              ) : (
                <span>&#123;...&#125;</span> // Curly braces
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu - Terminal dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-3 bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
            <nav className="flex flex-col space-y-3 px-4">
              {navLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.path}
                  className={`font-mono text-sm py-1.5 ${
                    location.pathname === link.path 
                      ? 'text-cyan-400 pl-2 border-l-2 border-cyan-400' 
                      : 'text-gray-400 hover:text-white'
                  } transition duration-300`}
                >
                  {link.text}
                </Link>
              ))}
              <hr className="border-gray-800 my-1" />
              <Link 
                to="/auth/login"
                className="font-mono text-sm text-gray-400 hover:text-white py-1.5 transition duration-300"
              >
                $ login
              </Link>
              <Link 
                to="/auth/register"
                className="font-mono text-sm bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-900 py-1.5 px-3 rounded text-center transition duration-300"
              >
                 register
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;