import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 font-mono tracking-wide border-t border-gray-800">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="space-y-6">
            <div className="text-3xl font-bold text-green-400"><span className="text-cyan-400">&lt;</span>
              <span className="text-gray-100">Eco</span>
              <span className="text-cyan-400">&gt;</span></div>
            <p className="text-gray-500 text-sm">
              Built for the 10x devs. Minimal, blazing-fast, and built to scale.
            </p>
            <div className="flex space-x-4">
              {/* Social Icons */}
              {[
                { href: "https://twitter.com", label: "Twitter" },
                { href: "https://github.com", label: "GitHub" },
                { href: "https://linkedin.com", label: "LinkedIn" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition duration-300"
                >
                  <span className="sr-only">{label}</span>
                  <i className={`devicon-${label.toLowerCase()}-plain text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Testimonials', 'FAQ'] },
            { title: 'Resources', links: ['Docs', 'Blog', 'Community', 'Support'] },
            { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-white text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="hover:text-green-400 transition">
                      &gt; {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} DevTracker. Made for the terminal junkies.</p>
          <div className="space-x-3 mt-3 md:mt-0">
            <Link to="#" className="hover:text-green-400">Privacy</Link>
            <Link to="#" className="hover:text-green-400">Terms</Link>
            <Link to="#" className="hover:text-green-400">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
