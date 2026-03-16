import { Avatar, Typography } from "@mui/material";
import styles from "./post.module.css";
import type { PostData } from "@food-trek/schemas";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { AddOrUpdatePostModal } from "../add-or-update-post-modal";
import { deletePost } from "../../api/postsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CommentIcon from "@mui/icons-material/Comment";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { AddCommentModal, ViewCommentsModal } from "../";
import { getCommentsCountByPostId } from "../../api/commentsApi";

interface Props {
  postData: PostData;
  isReadOnly?: boolean;
}

export const Post: React.FC<Props> = ({ postData, isReadOnly = true }) => {
  const {
    _id: postId,
    userId: { username, imgUrl: userProfileImage },
    imageUrl: postImage,
    text: postText,
  } = postData;

  const [isUpdatePostModalOpen, setIsUpdatePostModalOpen] = useState(false);
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);
  const [isViewCommentsModalOpen, setIsViewCommentsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: commentsCountObject } = useQuery({
    queryKey: getCommentsCountByPostId(postId).key,
    queryFn: getCommentsCountByPostId(postId).fn,
  });

  return (
    <div className={styles.postContainer}>
      <div className={styles.cardHeader}>
        <Avatar src={userProfileImage} className={styles.profileImage} />
        <div className={styles.username}>
          <Typography fontWeight="bold">{username}</Typography>
        </div>
        {!isReadOnly && (
          <div className={styles.upperIconButtons}>
            <EditIcon color="primary" className={styles.editIcon} onClick={() => setIsUpdatePostModalOpen(true)} />
            <DeleteIcon
              color="error"
              className={styles.deleteIcon}
              onClick={() =>
                deletePost.fn(postId).then(() => queryClient.invalidateQueries({ queryKey: ["posts", "user-page"] }))
              }
            />
          </div>
        )}
      </div>
      <img src={postImage} className={styles.postImage} />
      <div className={styles.cardContent}>
        <Typography variant="body2" color="text.primary">
          {postText}
        </Typography>
        <div className={styles.lowerIconButtons}>
          <ThumbUpIcon color="action" />
          <div
            className={`${styles.viewCommentsButton} ${commentsCountObject?.count === 0 && styles.disabledButton}`}
            onClick={() => setIsViewCommentsModalOpen(true)}
          >
            <CommentIcon color="primary" />
            {commentsCountObject?.count}
          </div>
          {isReadOnly && (
            <div className={styles.addCommentButton}>
              <AddCommentIcon color="success" onClick={() => setIsAddCommentModalOpen(true)} />
            </div>
          )}
        </div>
      </div>
      <AddOrUpdatePostModal
        isModalOpen={isUpdatePostModalOpen}
        setIsModalOpen={setIsUpdatePostModalOpen}
        postData={postData}
      />
      <ViewCommentsModal
        isModalOpen={isViewCommentsModalOpen}
        setIsModalOpen={setIsViewCommentsModalOpen}
        postId={postId}
      />
      <AddCommentModal isModalOpen={isAddCommentModalOpen} setIsModalOpen={setIsAddCommentModalOpen} postId={postId} />
    </div>
  );
};
