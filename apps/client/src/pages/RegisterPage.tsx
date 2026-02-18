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
import type { RegisterReq } from "@food-trek/schemas";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [registerForm, setRegisterForm] = useState<RegisterReq>({
    username: "",
    email: "",
    password: "",
  });
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (registerForm.password !== confirm) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    try {
      await register(registerForm);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed";
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
          Create Account
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Username"
          value={registerForm.username}
          onChange={(e) =>
            setRegisterForm((prev) => ({ ...prev, username: e.target.value }))
          }
          required
          autoFocus
          autoComplete="username"
        />

        <TextField
          label="Email"
          type="email"
          value={registerForm.email}
          onChange={(e) =>
            setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
          }
          required
          autoComplete="email"
        />

        <TextField
          label="Password"
          type="password"
          value={registerForm.password}
          onChange={(e) =>
            setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
          }
          required
          autoComplete="new-password"
        />

        <TextField
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          Register
        </Button>

        <Divider>or</Divider>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in failed")}
          auto_select={false}
          useOneTap={false}
        />

        <Typography align="center" variant="body2">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
