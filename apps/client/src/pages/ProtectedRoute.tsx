import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import type { ReactNode } from "react";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
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

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
