import {
  IconButton,
  Avatar,
  type AvatarProps,
  Tooltip,
  Box,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useRef } from "react";

const UserAvatar = ({
  img,
  avatarProps,
  onClick,
}: Pick<UploadUserAvatarProps, "img" | "avatarProps"> & {
  onClick?: () => void;
}) => {
  return (
    <Avatar
      sx={{
        width: 100,
        height: 100,
        ...avatarProps?.sx,
        border: "3px solid",
        borderColor: "primary.main",
      }}
      {...avatarProps}
      onClick={onClick}
      src={
        img
          ? typeof img === "string"
            ? img
            : URL.createObjectURL(img)
          : undefined
      }
    />
  );
};

type UploadUserAvatarProps = {
  img?: string | File | null;
  avatarProps?: Omit<AvatarProps, "src">;
} & (
  | {
      onClick?: (file: File | null) => void;
      isEditMode?: false;
    }
  | {
      onClick: (file: File | null) => void;
      isEditMode: true;
    }
);

export const UploadUserAvatar = ({
  img,
  onClick,
  isEditMode = false,
  avatarProps,
}: UploadUserAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEditMode) {
    return <UserAvatar img={img} avatarProps={avatarProps} />;
  }

  return (
    <Box sx={{ cursor: "pointer" }} position="relative" display="inline-block">
      <input
        accept="image/*"
        hidden
        id="avatar-file-input"
        type="file"
        ref={fileInputRef}
        onChange={(event) => {
          onClick?.(event.target.files?.[0] ?? null);
        }}
      />
      <UserAvatar
        img={img}
        avatarProps={avatarProps}
        onClick={() => fileInputRef.current?.click()}
      />
      <Tooltip title="Change photo">
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
        >
          <PhotoCamera fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
