import { Routes, Route } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import AuthLayout from "../layouts/AuthLayout";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import SpotifyPage from "../pages/dashboard/SpotifyPage";
import PlaylistDetails from "../pages/dashboard/PlaylistDetails";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BaseLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />

        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="spotify" element={<SpotifyPage />} />
        <Route path="playlist/:playlistId" element={<PlaylistDetails />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
