import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  const containerRef = useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    // Background animation
    gsap.to(containerRef.current, {
      backgroundPosition: '100% 50%',
      duration: 30,
      repeat: -1,
      yoyo: true,
      ease: 'none'
    });

    // Floating particles animation
    particlesRef.current.forEach((particle, i) => {
      gsap.to(particle, {
        x: gsap.utils.random(-20, 20),
        y: gsap.utils.random(-20, 20),
        duration: gsap.utils.random(3, 6),
        repeat: -1,
        yoyo: true,
        delay: i * 0.5,
        ease: 'sine.inOut'
      });
    });

    return () => gsap.killTweensOf([containerRef.current, ...particlesRef.current]);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gray-950"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.1) 0%, transparent 30%),
          radial-gradient(circle at 80% 70%, rgba(74, 222, 128, 0.1) 0%, transparent 30%)
        `,
        backgroundSize: '200% 200%'
      }}
    >
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          ref={el => particlesRef.current[i] = el}
          className={`absolute rounded-full opacity-20 ${
            i % 2 === 0 ? 'bg-cyan-400' : 'bg-emerald-400'
          }`}
          style={{
            width: gsap.utils.random(4, 8),
            height: gsap.utils.random(4, 8),
            left: `${gsap.utils.random(10, 90)}%`,
            top: `${gsap.utils.random(10, 90)}%`
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;