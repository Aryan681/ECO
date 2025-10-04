import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FeatureCards from "../../components/hero/FeaturtefHighlight";

const HeroSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRef = useRef(null);
  const terminalRef = useRef(null);
  const typeRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Animate the background pattern


    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const typeLine = (lineEl, text, delay) => {
      let index = 0;
      const type = () => {
        if (index <= text.length) {
          lineEl.textContent = text.substring(0, index);
          index++;
          setTimeout(type, 30);
        }
      };
      setTimeout(type, delay);
    };

    if (terminalRef.current) {
      const lines = terminalRef.current.querySelectorAll(".terminal-line");
      lines.forEach((line, i) => {
        const original = line.textContent;
        line.textContent = "";
        typeLine(line, original, i * 800);
      });
    }

    // Main animations
    tl.fromTo(
      headingRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
      .fromTo(
        subheadingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(
        imageRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2 },
        "-=0.8"
      );

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        gsap.to(imageRef.current, {
          y: self.progress * 100,
          duration: 0.1,
        });
      },
    });

    const words = ["workspace", "cloud", "ide", "runtime", "terminal"];
    let wordIndex = 0;
    let charIndex = 0;
    let typingForward = true;

    const typeWriterLoop = () => {
      if (!typeRef.current) return;

      const word = words[wordIndex];
      if (typingForward) {
        typeRef.current.textContent = word.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === word.length) {
          typingForward = false;
          setTimeout(typeWriterLoop, 1200);
          return;
        }
      } else {
        typeRef.current.textContent = word.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          typingForward = true;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      setTimeout(typeWriterLoop, typingForward ? 100 : 40);
    };

    typeWriterLoop();

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen bg-gray-950 flex items-center border-t border-gray-800"
    >
      {/* moving  background */}
      <div
        className="absolute inset-0 opacity-[0.1] overflow-hidden"
      >
        <div
          className="absolute inset-0 w-[200%] h-[200%] bg-[length:40px_40px] bg-repeat"
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

      {/* Glow effects */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl opacity-10"></div>

      <div className="container mx-auto px-4 py-20 md:py-32 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-gray-100 space-y-8">
            <h1
              ref={headingRef}
              className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold leading-tight"
            >
              <span className="text-cyan-400">&lt;</span>
              <span className="text-gray-100">Eco</span>
              <span className="text-cyan-400">&gt;</span>
              <br />
              <span className="text-emerald-400">dev</span>
              <span className="text-gray-400">.</span>
              <span className="text-amber-400" ref={typeRef}></span>
              <span className="text-cyan-400">()</span>
            </h1>

            <p
              ref={subheadingRef}
              className="text-lg md:text-xl text-gray-400 max-w-lg font-mono"
            >
              // All-in-one environment for serious developers
              <br />
              // Integrated IDE • Cloud Runtime • GitOps
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/auth/register"
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-gray-100 font-mono font-semibold rounded border border-cyan-400/30 hover:border-cyan-400/50 transition duration-300 text-center"
              >
                $ getStart eco
              </Link>
             
            </div>
          </div>

          <div ref={imageRef} className="hidden md:block relative">
            {/* Interactive terminal */}
            <div
              ref={terminalRef}
              className="bg-gray-900 rounded-lg border border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  terminal — zsh
                </div>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="terminal-line text-emerald-400">
                  $ eco init my-project
                </div>
                <div className="terminal-line text-gray-400 mt-2">
                  → Initializing workspace...
                </div>
                <div className="terminal-line text-cyan-400 mt-2">
                  $ eco add python@3.11
                </div>
                <div className="terminal-line text-gray-400 mt-2">
                  → Installing runtime (32MB)
                </div>
                <div className="terminal-line text-purple-400 mt-2">
                  $ git push eco main
                </div>
                <div className="terminal-line text-gray-400 mt-2 blink">▋</div>
              </div>
            </div>

            {/* Status bar */}
            <div className="absolute -bottom-5 left-0 right-0 mx-auto w-11/12 bg-gray-800 rounded-b-lg border border-t-0 border-gray-700 px-4 py-2 flex justify-between">
              <div className="text-xs text-gray-500 font-mono flex space-x-4">
                <span>main*</span>
                <span>UTF-8</span>
                <span>Python 3.11</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                <span className="text-amber-400">3</span>
                <span className="text-gray-600">/</span>
                <span className="text-cyan-400">5</span> containers active
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-20 mt-28"
          id="features"
        >
          {/* <div className="flex flex-wrap justify-center gap-6">
            <FeatureCards />
          </div> */}
        </div>
      </div>

     
    </section>
  );
};

export default HeroSection;
