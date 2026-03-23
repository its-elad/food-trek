import { useState } from "react";
import { Box, Button, Divider, TextField, Typography, Alert, CircularProgress } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { GoogleLogin } from "@react-oauth/google";
import { loginSchema, type LoginReq } from "@food-trek/schemas";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLogin, loginUser } from "../api/authApi.js";

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationKey: loginUser.key,
    mutationFn: loginUser.fn,
    meta: { disableLoadingDefault: true },
    onSuccess(userData) {
      setUser(userData);
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationKey: googleLogin.key,
    mutationFn: googleLogin.fn,
    meta: { disableLoadingDefault: true },
    onSuccess(userData) {
      setUser(userData);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginReq>({
    resolver: zodResolver(loginSchema),
  });

  const [serverError, setServerError] = useState("");

  const queryClient = useQueryClient();

  const onSubmit = async (data: LoginReq) => {
    setServerError("");
    try {
      await loginMutation.mutateAsync(data);
      await queryClient.invalidateQueries();
      navigate("/");
    } catch (err: unknown) {
      setServerError((err instanceof AxiosError && err.response?.data?.message) || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await loginWithGoogleMutation.mutateAsync(credentialResponse.credential);
      await queryClient.invalidateQueries();
      navigate("/");
    } catch {
      setServerError("Google sign-in failed");
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
        onSubmit={handleSubmit(onSubmit)}
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

        {serverError && <Alert severity="error">{serverError}</Alert>}

        <TextField
          label="Username"
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          autoFocus
          autoComplete="username"
        />

        <TextField
          label="Password"
          type="password"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={18} color="inherit" />}
        >
          Sign In
        </Button>

        <Divider>or</Divider>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setServerError("Google sign-in failed")}
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
