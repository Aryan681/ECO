import { Outlet } from 'react-router-dom';
import Navbar from '../components/base/Navbar';
import Footer from '../components/base/Footer';
// import { AuthProvider } from '../context/AuthContext';

const BaseLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      
        <Navbar />
        <main className="flex-grow">
          <Outlet /> {/* This will render either MainLayout or AuthLayout content */}
        </main>
        <Footer />
     
    </div>
  );
};

export default BaseLayout;
