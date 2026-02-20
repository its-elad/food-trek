import { useState } from "react";
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
import { registerSchema, type UserInfo } from "@food-trek/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadFile } from "../api/filesApi.js";
import { UploadUserAvatar } from "../components/UploadUserAvatar.js";
import { googleLogin, registerUser } from "../api/authApi.js";

const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async ({
    confirmPassword: _,
    ...data
  }: RegisterFormData) => {
    setServerError("");
    try {
      let user: UserInfo;
      if (imgFile) {
        const { url: imgUrl } = await uploadFile.fn(imgFile);
        user = await registerUser.fn({ ...data, imgUrl });
      } else {
        user = await registerUser.fn(data);
      }
      if (user) setUser(user);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed";
      setServerError(msg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) return;
    try {
      const user = await googleLogin.fn(credentialResponse.credential);
      setUser(user);
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
          Create Account
        </Typography>

        {serverError && <Alert severity="error">{serverError}</Alert>}

        <UploadUserAvatar
          img={imgFile}
          onClick={setImgFile}
          isEditMode={true}
        />

        <TextField
          label="Username"
          {...field("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          autoFocus
          autoComplete="username"
        />

        <TextField
          label="Email"
          type="email"
          {...field("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          autoComplete="email"
        />

        <TextField
          label="Password"
          type="password"
          {...field("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="new-password"
        />

        <TextField
          label="Confirm Password"
          type="password"
          {...field("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting && <CircularProgress size={18} color="inherit" />
          }
        >
          Register
        </Button>

        <Divider>or</Divider>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setServerError("Google sign-in failed")}
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
