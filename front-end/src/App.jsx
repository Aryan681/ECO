import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Initialize any global GSAP settings here
    gsap.config({
      nullTargetWarn: false,
    });
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;