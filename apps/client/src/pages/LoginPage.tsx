import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { GoogleLogin } from "@react-oauth/google";
import type { LoginReq } from "@food-trek/schemas";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState<LoginReq>({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginForm);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) return;
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch {
      setError("Google sign-in failed");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" fontWeight={700} align="center">
          Sign In
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Username"
          value={loginForm.username}
          onChange={(e) =>
            setLoginForm((prev) => ({ ...prev, username: e.target.value }))
          }
          required
          autoFocus
          autoComplete="username"
        />

        <TextField
          label="Password"
          type="password"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm((prev) => ({ ...prev, password: e.target.value }))
          }
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          Sign In
        </Button>

        <Divider>or</Divider>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in failed")}
          auto_select={false}
          useOneTap={false}
        />

        <Typography align="center" variant="body2">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            style={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
            }}
          >
            Register
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
