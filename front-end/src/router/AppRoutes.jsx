import { Routes, Route } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout"; // import RootLayout
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BaseLayout />}>
        {/* Main Application Pages */}
        <Route index element={<HomePage />} />{" "}
        {/* Home page directly under Root */}
        <Route path="about" element={<AboutPage />} />
        {/* Auth Pages */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        // In your router configuration
        
      </Route>
      <Route path="/dashboard" element={<DashboardLayout />}>
          {/* <Route path="code" element={<CodeEditorPage />} />
          <Route path="timer" element={<PomodoroPage />} />
          <Route path="spotify" element={<SpotifyPage />} />
          <Route path="github" element={<GithubPage />} /> */}
        </Route>
    </Routes>
  );
};

export default AppRoutes;
