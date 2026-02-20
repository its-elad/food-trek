import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../contexts/AuthContext.js";
import { uploadFile } from "../api/filesApi.js";
import { updateUserSchema, type UpdateUserReq } from "@food-trek/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { UploadUserAvatar } from "../components/UploadUserAvatar.js";
import { updateUser } from "../api/authApi.js";

const SKELETON_POST_COUNT = 6;

export default function UserPage() {
  const { user, setUser } = useAuth();

  const [isEditMode, setIsEditMode] = useState(false);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserReq>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { username: user?.username ?? "" },
  });

  const handleEdit = () => {
    reset({ username: user?.username ?? "" });
    setImgFile(null);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setImgFile(null);
  };

  const onSubmit = async (data: UpdateUserReq) => {
    const usernameChanged = data.username !== user?.username;
    const fileChanged = imgFile !== null;

    if (!usernameChanged && !fileChanged) {
      handleCancel();
      return;
    }

    try {
      let imgUrl = undefined;

      if (fileChanged) {
        const uploaded = await uploadFile.fn(imgFile);
        imgUrl = uploaded.url;
      }

      const updatedUser = await updateUser.fn({
        username: data.username,
        imgUrl,
      });
      setUser(updatedUser);
      setSnackbar({
        open: true,
        message: "Profile updated!",
        severity: "success",
      });
      setIsEditMode(false);
      setImgFile(null);
    } catch (err) {
      const message =
        (err instanceof AxiosError && err.response?.data?.message) ||
        "Failed to update profile";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ px: 3, py: 6 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 4, mb: 5 }}>
        <UploadUserAvatar
          img={imgFile || user?.imgUrl}
          isEditMode={isEditMode}
          onClick={setImgFile}
        />

        <Box sx={{ flex: 1 }}>
          {isEditMode ? (
            <TextField
              label="Username"
              size="small"
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
              autoFocus
            />
          ) : (
            <Typography variant="h5" fontWeight={700}>
              {user?.username}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user?.email}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {isEditMode && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={isEditMode ? <SaveIcon /> : <EditIcon />}
            onClick={isEditMode ? handleSubmit(onSubmit) : handleEdit}
            disabled={isSubmitting}
          >
            {isEditMode ? "Save" : "Edit Profile"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Posts
      </Typography>

      <Grid container spacing={2} width="50%">
        {Array.from({ length: SKELETON_POST_COUNT }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Skeleton variant="rectangular" height={180} />
              <Box sx={{ p: 1.5 }}>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
