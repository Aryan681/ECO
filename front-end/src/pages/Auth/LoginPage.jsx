import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios'; 
const LoginPage = () => {
  const formRef = useRef();
  const terminalRef = useRef();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle email login
 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // No need to handle tokens - they're in cookies
      console.log('Login successful:', response.data);
      
      // Redirect to home/dashboard
      navigate('/');
      
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  // Handle GitHub authentication
  const handleGitHubAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Redirect to GitHub OAuth
      window.location.href = 'http://localhost:3000/api/github/login';
      
      // Alternatively, if using popup:
      // const popup = window.open('http://localhost:3000/api/github/login', '_blank');
      // const checkPopup = setInterval(() => {
      //   if (popup.closed) {
      //     clearInterval(checkPopup);
      //     // Check if user is authenticated
      //     navigate('/dashboard');
      //   }
      // }, 500);
    } catch (err) {
      console.error('GitHub auth error:', err);
      setError('Failed to initiate GitHub authentication');
      setLoading(false);
    }
  };

  // Animation setup
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const typeLine = (lineEl, text) => {
      let index = 0;
      const type = () => {
        if (index <= text.length) {
          lineEl.textContent = text.substring(0, index);
          index++;
          setTimeout(type, 80);
        }
      };
      type();
    };
  
    if (terminalRef.current) {
      const lines = terminalRef.current.querySelectorAll(".terminal-line");
      
      lines.forEach((line, i) => {
        const original = line.textContent;
        line.textContent = "";
  
        tl.to({}, {
          duration: 0.03 * original.length,
          onStart: () => typeLine(line, original)
        }, i * 0.8);
      });
    }
  
    // After typing is done, animate form elements
    if (formRef.current) {
      const formChildren = Array.from(formRef.current.children).filter(
        (el) => el.nodeType === 1
      );
    
      tl.from(formChildren, {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }, "+=0.5");
    }

    // Floating animation for terminal
    if (terminalRef.current) {
      gsap.to(terminalRef.current, {
        y: 10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div
        ref={terminalRef}
        className="bg-gray-800 border-b border-gray-700 px-5 py-3"
      >
        <div className="flex items-center">
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div className="text-xs text-gray-400 font-mono">login.tsx</div>
        </div>
        <div className="mt-2 font-mono text-sm">
          <p className="terminal-line text-emerald-400">$ echo authenticate</p>
          <p className="terminal-line text-gray-400 mt-1">{`> Welcome back developer`}</p>
        </div>
      </div>

      {/* Auth Form */}
      <form ref={formRef} className="p-6 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 font-mono text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-gray-400 font-mono text-sm mb-2">
            // Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-white font-mono"
            placeholder="user@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 font-mono text-sm mb-2">
            // Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-white font-mono"
            placeholder="********"
            required
            minLength="6"
          />
        </div>

        <button 
          type="submit"
          className={`w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono rounded-lg flex items-center justify-center ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </>
          ) : (
            '$ login'
          )}
        </button>

        <div className="text-center text-gray-500 font-mono text-sm">
          <span className="mr-2">// New to echo?</span>
          <Link to="/auth/register" className="text-cyan-400 hover:underline">
            create account
          </Link>
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 font-mono text-xs">
            OR
          </span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button 
          type="button"
          onClick={handleGitHubAuth}
          className={`w-full py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 font-mono rounded-lg flex items-center justify-center ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          Continue with GitHub
        </button>
      </form>
    </div>
  );
};

export default LoginPage;