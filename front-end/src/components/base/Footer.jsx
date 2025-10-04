import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Zap,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", to: "#features", icon: <Zap size={16} /> },
        { name: "Pricing", to: "#pricing", icon: <FileText size={16} /> },
        { name: "Changelog", to: "#changelog", icon: <Settings size={16} /> },
        { name: "Community", to: "#community", icon: <Users size={16} /> },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", to: "#docs", icon: <FileText size={16} /> },
        { name: "Blog", to: "#blog", icon: <FileText size={16} /> },
        { name: "Support", to: "#support", icon: <Users size={16} /> },
        { name: "API Reference", to: "#api", icon: <Settings size={16} /> },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", to: "#about", icon: <Users size={16} /> },
        { name: "Careers", to: "#careers", icon: <Users size={16} /> },
        { name: "Privacy", to: "#privacy", icon: <FileText size={16} /> },
        { name: "Terms", to: "#terms", icon: <FileText size={16} /> },
      ],
    },
  ];

  useEffect(() => {
    const sections = footerRef.current.querySelectorAll(".animate-footer");

    gsap.fromTo(
      sections,
      { y: 50, opacity: 0 }, // from state
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom-=100",
          toggleActions: "play reverse play reverse",
          // markers: true,
        },
      }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#050505] text-gray-400 tracking-wide border-t border-gray-800"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse opacity-50"></div>

      <div className="container mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
          {/* Brand & Description */}
          <div className="col-span-2 space-y-6 animate-footer">
            <div className="text-4xl font-extrabold text-cyan-400 flex items-center gap-2 font-mono">
              <span className="text-cyan-400">&lt;</span>
              <span className="text-gray-100">Eco</span>
              <span className="text-cyan-400">&gt;</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Eco is the <strong>unified development environment</strong> for
              building, deploying, and scaling modern software projects
              efficiently.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-3 pt-4 animate-footer">
              {[
                {
                  href: "https://twitter.com",
                  icon: <Twitter size={18} />,
                  label: "Twitter",
                },
                {
                  href: "https://github.com",
                  icon: <Github size={18} />,
                  label: "GitHub",
                },
                {
                  href: "https://linkedin.com",
                  icon: <Linkedin size={18} />,
                  label: "LinkedIn",
                },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-900 border border-gray-700 text-gray-400 
                             hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.5)] transition duration-300"
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1 animate-footer">
              <h3 className="text-cyan-300 text-sm font-bold uppercase tracking-widest mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-gray-500 hover:text-cyan-400 transition flex items-center gap-3 font-mono group"
                    >
                      <span className="text-cyan-500/80 transition-all duration-300 transform group-hover:translate-x-1 group-hover:scale-110">
                        {link.icon}
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 animate-footer">
          <p className="order-2 md:order-1 mt-4 md:mt-0 font-mono">
            © {new Date().getFullYear()} Eco Technologies. All rights reserved.
            <span className="text-gray-500 ml-2">
              {" "}
              | Built for the future of development.
            </span>
          </p>

          <div className="flex space-x-6 order-1 md:order-2">
            <Link to="#privacy" className="hover:text-cyan-400 transition">
              Privacy Policy
            </Link>
            <Link to="#terms" className="hover:text-cyan-400 transition">
              Terms of Service
            </Link>
            <Link to="#security" className="hover:text-cyan-400 transition">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
