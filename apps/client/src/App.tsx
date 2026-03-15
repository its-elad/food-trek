import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import ChatPage from "./pages/ChatPage.js";
import HomePage from "./pages/HomePage.js";
import ProtectedRoute from "./pages/ProtectedRoute.js";
import { HomeFeedPage, UserPage } from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home-feed" element={<HomeFeedPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
