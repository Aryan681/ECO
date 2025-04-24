import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const formRef = useRef();
  const terminalRef= useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const typeLine = (lineEl, text) => {
      let index = 0;
      const type = () => {
        if (index <= text.length) {
          lineEl.textContent = text.substring(0, index);
          index++;
          setTimeout(type, 80); // Typing speed
        }
      };
      type();
    };
  
    if (terminalRef.current) {
      const lines = terminalRef.current.querySelectorAll(".terminal-line");
      
      lines.forEach((line, i) => {
        const original = line.textContent;
        line.textContent = "";
  
        // Add a dummy tween to control delay via timeline
        tl.to({}, {
          duration: 0.03 * original.length, // Match typing duration
          onStart: () => typeLine(line, original)
        }, i * 0.8); // stagger each line
      });
    }

    // Particle float animation
    particlesRef.current.forEach((particle, i) => {
      gsap.to(particle, {
        x: gsap.utils.random(-40, 40),
        y: gsap.utils.random(-40, 40),
        rotation: gsap.utils.random(-30, 30),
        duration: gsap.utils.random(5, 9),
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
        ease: 'sine.inOut'
      });
    });

    // Animate form elements after header typing
    const formChildren = Array.from(formRef.current.children).filter(el => el.nodeType === 1);

    tl.from(formChildren, {
      y: 20,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'back.out(1.2)'
    }, "+=0.4");
  }, []);

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header with Particle Background */}
      <div
        className="bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 border-b border-gray-700 px-6 py-5 relative overflow-hidden"
        ref={terminalRef}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (particlesRef.current[i] = el)}
            className={`absolute ${
              i % 2 === 0 ? 'text-cyan-400/20' : 'text-emerald-400/20'
            } text-4xl`}
            style={{
              top: `${gsap.utils.random(10, 90)}%`,
              left: `${gsap.utils.random(10, 90)}%`
            }}
          >
            {i % 2 === 0 ? '< />' : '{ }'}
          </div>
        ))}
        <div className="relative z-10 font-mono text-sm">
          <p className="terminal-line text-emerald-400">$ createAccount()</p>
          <p className="terminal-line text-gray-400 mt-1">// Join the productivity revolution</p>
        </div>
      </div>

      {/* Auth Form */}
      <div ref={formRef} className="p-6 space-y-5">
        <div>
          <label className="block text-gray-400 font-mono text-sm mb-2">// Username</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-white font-mono"
            placeholder="dev_username"
          />
        </div>
        <div>
          <label className="block text-gray-400 font-mono text-sm mb-2">// Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-white font-mono"
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="block text-gray-400 font-mono text-sm mb-2">// Password</label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-white font-mono"
            placeholder="********"
          />
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono rounded-lg">
          $ register
        </button>
        <div className="text-center text-gray-500 font-mono text-sm">
          <span className="mr-2">// Already have an account?</span>
          <Link to="/auth/login" className="text-cyan-400 hover:underline">login here</Link>
        </div>
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 font-mono text-xs">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button className="w-full py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 font-mono rounded-lg flex items-center justify-center ">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
