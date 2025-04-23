import { useEffect } from 'react';
import HeroSection from '../containers/hero/HeroSection';


const HomePage = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Eco ';
  }, []);

  return (
    <div className="homepage">
      <HeroSection />
   
    </div>
  );
};

export default HomePage;