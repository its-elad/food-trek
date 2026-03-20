import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import ProtectedRoute from "./pages/ProtectedRoute.js";
import { HomeFeedPage, UserPage, ChatPage, HomePage } from "./pages";
import { NavbarRoutesEnum } from "./types";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path={NavbarRoutesEnum.HOME_PAGE} element={<HomePage />} />
        <Route path={NavbarRoutesEnum.HOME_FEED} element={<HomeFeedPage />} />
        <Route path={NavbarRoutesEnum.USER_PAGE} element={<UserPage />} />
        <Route path={NavbarRoutesEnum.CHATBOT} element={<ChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
