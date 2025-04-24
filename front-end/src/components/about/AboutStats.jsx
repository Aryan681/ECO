import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const stats = [
  { value: "10K+", label: "Active Users", color: "text-cyan-400" },
  { value: "2M+", label: "Pomodoros Completed", color: "text-emerald-400" },
  { value: "95%", label: "Uptime", color: "text-purple-400" },
  { value: "1", label: "Passionate Creator", color: "text-amber-400" }
];

const AboutStats = () => {
  const statsRef = useRef([]);

  useEffect(() => {
    statsRef.current.forEach((stat, index) => {
      if (!stat) return;
  
      gsap.fromTo(
        stat,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.2)",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: stat,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }, []);
  

  return (
    <section className="py-16 bg-gray-900/30 border-y border-gray-800/50 my-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              ref={el => statsRef.current[index] = el}
              className={`text-center p-6 bg-gray-900/50 rounded-xl border ${stat.color.replace('text-', 'border-')}/20`}
            >
              <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 font-mono text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStats;