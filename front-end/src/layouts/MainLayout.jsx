import { Outlet } from 'react-router-dom';
import Navbar from '../components/base/Navbar';
import Footer from '../components/base/Footer';

const MainLayout = () => {
  return (
    
      
      <main className="flex-grow">
        <Outlet />
      </main>
     
  );
};

export default MainLayout;