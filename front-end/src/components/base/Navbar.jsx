import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import axios from "axios";

// Centralized nav links
const NAV_LINKS = [
  { label: "Hero{}", path: "/" },
  { label: "docs", path: "/docs" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "About[]", path: "/about" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // --- Auth Management ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setUser(token && userData ? JSON.parse(userData) : null);
  }, [location]);

  // --- Scroll Behavior ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Animations (Logo + Links) ---
  useEffect(() => {
    gsap.fromTo(
      ".nav-item",
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      }
    );

    gsap.to(".logo-cursor", {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.8,
    });
  }, []);

  // --- Logout ---
  const handleLogout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      await axios.post(
        "http://localhost:3000/api/auth/logout",
        { refreshToken },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (err) {
      console.warn("Logout error:", err.message);
    } finally {
      // Always clear local storage
      ["token", "refreshToken", "user"].forEach((key) =>
        localStorage.removeItem(key)
      );
      setUser(null);
      navigate("/");
    }
  }, [navigate]);

  // --- Render Helpers ---
  const renderDesktopLinks = () =>
    NAV_LINKS.map(({ label, path }) => (
      <Link
        key={path}
        to={path}
        className={`nav-item font-mono text-xl ${
          location.pathname === path
            ? "text-cyan-400 border-b border-cyan-400"
            : "text-gray-400 hover:text-white"
        } transition duration-300`}
      >
        {label}
      </Link>
    ));

  const renderUserMenu = () => {
    if (!user) {
      return (
        <>
          <Link
            to="/auth/login"
            className="font-mono text-lg text-gray-400 hover:text-white px-3 py-1 border border-gray-700 hover:border-gray-600 rounded transition duration-300"
          >
            login
          </Link>
          <Link
            to="/auth/register"
            className="font-mono text-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-900 px-3 py-1 rounded transition duration-300"
          >
            npm start
          </Link>
        </>
      );
    }

    const displayName =
      user.profile?.firstName || user.email?.split("@")[0] || "User";
    const initial = user.profile?.firstName?.[0] || user.email?.[0] || "?";

    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-800 border border-cyan-400 flex items-center justify-center overflow-hidden">
          <span className="text-cyan-400 text-xs font-bold">
            {initial.toUpperCase()}
          </span>
        </div>
        <span className="font-mono text-sm text-gray-300">{displayName}</span>
        <button
          onClick={handleLogout}
          className="font-mono text-sm text-gray-400 hover:text-red-400 px-3 py-1 border border-gray-700 hover:border-red-400/30 rounded transition duration-300"
        >
          $ logout
        </button>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-3 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl rounded-3xl z-50 transition-all duration-300 border ${
        scrolled
          ? "bg-gray-950/95 backdrop-blur-md border-white/40 py-4"
          : "bg-gray-950/80 border-white/20 py-4"
      }`}
   
    >
      <div className="flex justify-between items-center px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <span className="font-mono text-2xl text-cyan-400 mr-1">$</span>
          <span className="font-mono font-bold text-2xl text-white group-hover:text-cyan-400 transition duration-300">
            Eco<span className="logo-cursor">_</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex ml-8  items-center space-x-6">
          {renderDesktopLinks()}
        </nav>

        {/* User Section */}
        <div className="hidden md:flex items-center space-x-3">
          {renderUserMenu()}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            className="text-gray-400 hover:text-white focus:outline-none font-mono"
          >
            {menuOpen ? (
              <span className="text-cyan-400">&#x2715;</span>
            ) : (
              <span>&#123;...&#125;</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 py-3 bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
          <nav className="flex flex-col  space-y-3 px-4">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`font-mono text-sm py-1.5 ${
                  location.pathname === path
                    ? "text-cyan-400 pl-2 border-l-2 border-cyan-400"
                    : "text-gray-400 hover:text-white"
                } transition duration-300`}
              >
                {label}
              </Link>
            ))}

            <hr className="border-gray-800 my-1" />
            {user ? (
              <button
                onClick={handleLogout}
                className="font-mono text-sm text-red-400 hover:text-red-300 py-1.5 pl-2 border-l-2 border-red-400/30 transition duration-300 text-left"
              >
                $ logout
              </button>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="font-mono text-sm text-gray-400 hover:text-white py-1.5 transition duration-300"
                >
                  $ login
                </Link>
                <Link
                  to="/auth/register"
                  className="font-mono text-sm bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-900 py-1.5 px-3 rounded text-center transition duration-300"
                >
                  register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
