import { useState } from "react";
import { Box, Button, Snackbar, Alert, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../../contexts/AuthContext.js";
import { uploadFile } from "../../api/filesApi.js";
import { updateUserSchema, type PostData, type UpdateUserReq } from "@food-trek/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { UploadUserAvatar } from "../../components/UploadUserAvatar.js";
import { updateUser } from "../../api/authApi.js";
import styles from "./user-page.module.css";
import { useQuery } from "@tanstack/react-query";
import { getLoggedInUserPosts } from "../../api/postsApi.js";
import { AddOrUpdatePostModal, Navbar, Post, ViewCommentsModal } from "../../components";

export const UserPage: React.FC = () => {
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
      const message = (err instanceof AxiosError && err.response?.data?.message) || "Failed to update profile";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  const { data: loggedInUserPosts } = useQuery({
    queryKey: getLoggedInUserPosts.key,
    queryFn: getLoggedInUserPosts.fn,
    enabled: !!user,
  });

  const [viewCommentsModalPostId, setViewCommentsModalPostId] = useState<string | null>(null);
  const [updatePostModalPostData, setUpdatePostModalPostData] = useState<PostData | null>(null);

  return (
    <div className={styles.screenContainer}>
      <div className={styles.navbar}>
        <Navbar />
      </div>
      <div className={styles.pageContainer}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 4, mb: 5 }}>
          <UploadUserAvatar img={imgFile || user?.imgUrl} isEditMode={isEditMode} onClick={setImgFile} />
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
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={isEditMode ? <SaveIcon /> : <EditIcon />}
              onClick={isEditMode ? handleSubmit(onSubmit) : handleEdit}
              disabled={isSubmitting}
              sx={{ textTransform: "none" }}
            >
              {isEditMode ? "Save" : "Edit Profile"}
            </Button>
          </Box>
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Posts
        </Typography>
        <div className={styles.postsWrapper}>
          {loggedInUserPosts?.map((postData) => (
            <Post
              key={postData._id}
              postData={postData}
              isReadOnly={false}
              onViewComments={() => setViewCommentsModalPostId(postData._id)}
              onUpdatePost={() => setUpdatePostModalPostData(postData)}
            />
          ))}
        </div>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        <ViewCommentsModal
          isModalOpen={!!viewCommentsModalPostId}
          onClose={() => setViewCommentsModalPostId(null)}
          postId={viewCommentsModalPostId}
        />
        <AddOrUpdatePostModal
          isModalOpen={!!updatePostModalPostData}
          onClose={() => setUpdatePostModalPostData(null)}
          postData={updatePostModalPostData || undefined}
        />
      </div>
    </div>
  );
};
