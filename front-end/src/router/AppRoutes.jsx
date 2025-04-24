import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
  <Route path="login" element={<LoginPage />} />
  <Route path="register" element={<RegisterPage />} />
</Route>
      
    
    </Routes>
  );
};

export default AppRoutes;
