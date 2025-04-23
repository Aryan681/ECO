import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaCode, FaSpotify, FaClock, FaGithub } from 'react-icons/fa';
import { RiTerminalBoxFill } from 'react-icons/ri';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const features = [
    {
      title: 'editor',
      icon: <FaCode className="text-3xl" />,
      description:
        '// A blazing-fast, full-featured IDE with Vim/VS Code keybindings, syntax highlighting, IntelliSense, and workspace persistence built-in. Perfect for coding on the fly or pair programming remotely.',
      command: '$ eco open project',
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/30'
    },
    {
      title: 'pomodoro',
      icon: <FaClock className="text-3xl" />,
      description:
        '// Supercharge your focus with customizable Pomodoro timers, auto break scheduling, ambient sound integration, and visual progress tracking — all baked directly into your dashboard.',
      command: '$ eco focus start',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30'
    },
    {
      title: 'spotify',
      icon: <FaSpotify className="text-3xl" />,
      description:
        '// Seamless Spotify integration that lets you queue tracks, control playback, and discover new music while coding. Stay in flow without ever switching tabs.',
      command: '$ eco music play',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/30'
    },
    {
      title: 'git',
      icon: <FaGithub className="text-3xl" />,
      description:
        '// Commit, push, branch, and manage pull requests with a visual Git interface. No need for terminal commands — everything is just a click away.',
      command: '$ eco git push',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30'
    }
  ];
  

const FeatureCards = () => {
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Card animations
    cardsRef.current.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Hover effect
      gsap.to(card, {
        y: -10,
        duration: 0.3,
        paused: true,
        ease: 'power1.out'
      });

      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -10, duration: 0.3 });
        gsap.to(card.querySelector('.feature-icon'), { 
          scale: 1.1,
          duration: 0.3 
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.3 });
        gsap.to(card.querySelector('.feature-icon'), { 
          scale: 1,
          duration: 0.3 
        });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-gray-950 overflow-hidden border-t border-gray-800/50"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0zMCAxMGgxdjQwaC0xem0xMCAwaDF2NDBoLTF6bS0yMCAwaDF2NDBoLTF6TTAgMjBoNjB2MUgwek0wIDQwaDYwdjFIMHoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4wMiIvPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Terminal-style header */}
        <div className="flex justify-center mb-16">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center mb-3 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <RiTerminalBoxFill className="text-cyan-400 mr-2 text-xl" />
              <span className="font-mono text-sm text-cyan-400">features.js</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="text-gray-400">Eco.</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">coreFeatures</span>
              <span className="text-cyan-400">()</span>
            </h2>
            <p className="text-gray-400 font-mono max-w-lg mx-auto">
              // All features come with API access and full documentation
            </p>
          </div>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => (cardsRef.current[index] = el)}
              className={`${feature.bg} ${feature.border} rounded-xl p-6 border hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-${feature.color.replace('text-', '')}/10 group`}
            >
              <div className={`${feature.color} feature-icon mb-5 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className={`${feature.color} font-mono text-lg font-semibold mb-3`}>
                {feature.title}
              </h3>
              <p className="text-gray-300 font-mono text-sm mb-4">
                {feature.description}
              </p>
              <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                <p className="text-xs text-gray-400 font-mono truncate">
                  {feature.command}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View all prompt */}
        <div className="text-center mt-16">
         
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;