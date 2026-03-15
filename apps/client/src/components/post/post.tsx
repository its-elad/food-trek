import { Avatar, Typography, CardContent } from "@mui/material";
import styles from "./post.module.css";
import type { PostData } from "@food-trek/schemas";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { AddOrUpdatePostModal } from "../add-or-update-post-modal";
import { deletePost } from "../../api/postsApi";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  postData: PostData;
  isReadOnly?: boolean;
}

export const Post: React.FC<Props> = ({ postData, isReadOnly = true }) => {
  const {
    userId: { username, imgUrl: userProfileImage },
    imageUrl: postImage,
    text: postText,
  } = postData;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  return (
    <div className={styles.postContainer}>
      <div className={styles.cardHeader}>
        <Avatar src={userProfileImage} className={styles.profileImage} />
        <div className={styles.username}>
          <Typography fontWeight="bold">{username}</Typography>
        </div>
        {!isReadOnly && (
          <>
            <div className={styles.iconButtons}>
              <EditIcon color="primary" className={styles.editIcon} onClick={() => setIsModalOpen(true)} />
              <DeleteIcon
                color="error"
                className={styles.deleteIcon}
                onClick={() =>
                  deletePost
                    .fn(postData._id)
                    .then(() => queryClient.invalidateQueries({ queryKey: ["posts", "user-page"] }))
                }
              />
            </div>
            <AddOrUpdatePostModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} postData={postData} />
          </>
        )}
      </div>
      <img src={postImage} className={styles.postImage} />
      <CardContent>
        <Typography variant="body2" color="text.primary">
          {postText}
        </Typography>
      </CardContent>
    </div>
  );
};
