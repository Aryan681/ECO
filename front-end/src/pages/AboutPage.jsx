import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TeamMember from '../components/about/TeamMember';
import AboutStats from '../components/about/AboutStats';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const sectionRefs = useRef([]);

  useEffect(() => {
    if (!sectionRefs.current) return;

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;

      gsap.fromTo(
        section,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          delay: index * 0.15,
        }
      );
    });

    const floatTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    floatTimeline.to('.floating-terminal', {
      y: 15,
      ease: 'sine.inOut',
      duration: 2,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      floatTimeline.kill();
    };
  }, []);

  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen pt-24 pb-32">
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 opacity-5 z-0">
        <div
          className="absolute inset-0 bg-[length:40px_40px] bg-repeat"
          style={{
            backgroundImage: `
              linear-gradient(to right, #22d3ee 1px, transparent 1px),
              linear-gradient(to bottom, #22d3ee 1px, transparent 1px),
              linear-gradient(to right, #34d399 1px, transparent 1px),
              linear-gradient(to bottom, #34d399 1px, transparent 1px)
            `,
            backgroundPosition: `
              0 0, 0 0, 20px 20px, 20px 20px
            `,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <section ref={(el) => (sectionRefs.current[0] = el)} className="py-20 text-center">
          <div className="inline-flex items-center mb-6 px-5 py-2 bg-gray-800 rounded-full border border-gray-700">
            <span className="font-mono text-sm text-cyan-400">about.tsx</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gray-400">eco.</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">about</span>
            <span className="text-cyan-400">()</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-mono">
            // A focused productivity OS for developers tired of context-switching.
          </p>
        </section>

        {/* Mission Section */}
        <section
          ref={(el) => (sectionRefs.current[1] = el)}
          className="py-16 grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="relative">
            <div className="floating-terminal bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-xs text-gray-400 font-mono">mission_terminal</div>
              </div>
              <div className="font-mono text-sm space-y-2">
                <p className="text-emerald-400">$ eco --why</p>
                <p className="text-gray-400"> {`> Escape the chaos of fragmented tools`}</p>
                <p className="text-gray-400">{`> Flow uninterrupted from code to completion`}</p>
                <p className="text-gray-400">{`> Reclaim focus, one keystroke at a time`}</p>
                <p className="text-cyan-400 blink mt-4">▋</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-cyan-400 mr-2">{"//"}</span>
              Why eco exists
            </h2>
            <div className="space-y-4 text-gray-300 font-mono">
              <p>
                eco was forged in frustration — born from long nights of juggling code editors, task boards, timers, and music tabs.
                All we wanted was to build. But noise, clutter, and context switches kept breaking the flow.
              </p>
              <p>
                So we built echo — a developer's second brain. One workspace, fully integrated.
              </p>
              <p>
                Built by devs, for devs, echo isn't just a tool. It's a manifesto:
              </p>
              <ul className="space-y-2 pl-5 list-disc list-inside">
                <li>Tools shouldn’t distract — they should disappear when not needed</li>
                <li>Workflows should be fast, keyboard-first, and fluid</li>
                <li>Integrations should be seamless, not stitched together</li>
                <li>Productivity shouldn't cost your mental bandwidth</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <AboutStats />

        {/* Team Section */}
        <section ref={(el) => (sectionRefs.current[2] = el)} className="py-16">
          <h2 className="text-3xl font-bold mb-12 text-center flex justify-center items-center">
            <span className="text-cyan-400 mr-2">{"//"}</span>
            The Mind Behind echo
          </h2>
          <TeamMember />
        </section>

        {/* CTA Section */}
        <section ref={(el) => (sectionRefs.current[3] = el)} className="py-16 text-center">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-cyan-400">$</span> Ready to stop tab-switching and start flowing?
            </h3>
            <p className="text-gray-400 mb-2 font-mono">// One install away from dev focus nirvana</p>
            <p className="text-gray-400 mb-2 font-mono">
              // Join thousands of developers who found their focus
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/auth/register"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono rounded transition duration-300"
              >
                npm install eco
              </a>
              <a
                href="/docs"
                className="px-6 py-3 border border-gray-700 hover:border-cyan-400 text-gray-400 hover:text-white font-mono rounded transition duration-300"
              >
                Read the docs
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
