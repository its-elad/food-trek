import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import { CircularProgress, Box } from "@mui/material";
import styles from "./protected-route.module.css";
import { Navbar } from "../../components";

export const ProtectedRoute: React.FC = () => {
  const { user, isGetUserLoading } = useAuth();

  if (isGetUserLoading) {
    return (
      <Box className={styles.circularProgressContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.screenContainer}>
      <div className={styles.navbar}>
        <Navbar />
      </div>
      <div className={styles.pageContainer}>
        <Outlet />
      </div>
    </div>
  );
};
