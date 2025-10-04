import { useEffect } from 'react';
import HeroSection from '../containers/hero/HeroSection';
import FeaturefHilight from "../containers/feat/FeaturtefHighlight"


const HomePage = () => {
  useEffect(() => {
    // Set page title
    document.title = 'ECO ';
  }, []);

  return (
    <div className="homepage">
      <HeroSection />
      <FeaturefHilight/>
   
    </div>
  );
};

export default HomePage;