import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {

  useEffect(() => {
    console.log('Current localStorage:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      githubToken: localStorage.getItem('githubAccessToken')
    });
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;