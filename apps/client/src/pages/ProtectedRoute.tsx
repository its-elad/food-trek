import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute() {
  const { user, isGetUserLoading } = useAuth();

  if (isGetUserLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
