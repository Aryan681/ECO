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

    // Handle GitHub auth callback message
    const handleMessage = (event) => {
      // Verify the origin for security if possible
      // if (event.origin !== "http://localhost:3000") return;
      
      if (event.data?.type === 'github-auth-success') {
        const { tokens, user } = event.data;
        
        // Store tokens
        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to home/dashboard
        window.location.href = '/';
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;