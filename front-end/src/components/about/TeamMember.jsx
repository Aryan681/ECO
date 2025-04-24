import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TeamMember = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        }
      }
    );
  }, []);

  return (
    <div 
      ref={containerRef}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 max-w-2xl mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full border-2 border-cyan-400/30 overflow-hidden">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">
              👨‍💻
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gray-950 border border-cyan-400 rounded-full px-3 py-1 text-xs font-mono">
            Founder.exe
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-1">Aryan Singh</h3>
          <p className="text-cyan-400 font-mono mb-4">Full Stack Developer</p>
          <p className="text-gray-300 mb-4 font-mono">
            // Built echo to solve my own productivity struggles. Obsessed with 
            creating tools that get out of your way.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-mono">React</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-mono">Node.js</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-mono">Design</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMember;