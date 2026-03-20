import { Avatar, Typography } from "@mui/material";
import styles from "./post.module.css";
import type { PostData } from "@food-trek/schemas";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { deletePost, getLoggedInUserPosts } from "../../api/postsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommentIcon from "@mui/icons-material/Comment";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { getCommentsCountByPostId } from "../../api/commentsApi";
import { addLike, getLoggedInUserLikeByPostId, getLikesCountByPostId } from "../../api/likesApi";
import { useState } from "react";

interface Props {
  postData: PostData;
  isReadOnly?: boolean;
  onViewComments: () => void;
  onAddComment?: () => void;
  onUpdatePost?: () => void;
}

export const Post: React.FC<Props> = ({ postData, isReadOnly = true, onViewComments, onAddComment, onUpdatePost }) => {
  const {
    _id: postId,
    userId: { username, imgUrl: userProfileImage },
    imageUrl: postImage,
    text: postText,
  } = postData;

  const queryClient = useQueryClient();

  const { data: commentsCountObject } = useQuery({
    queryKey: getCommentsCountByPostId(postId).key,
    queryFn: getCommentsCountByPostId(postId).fn,
  });

  const { data: likesCountObject } = useQuery({
    queryKey: getLikesCountByPostId(postId).key,
    queryFn: getLikesCountByPostId(postId).fn,
  });

  const { data: loggedInUserLike } = useQuery({
    queryKey: getLoggedInUserLikeByPostId(postId).key,
    queryFn: getLoggedInUserLikeByPostId(postId).fn,
  });

  const [isOptimisticallyLiked, setIsOptimisticallyLiked] = useState(false);

  const isPostLikedByUser = !!loggedInUserLike || isOptimisticallyLiked;

  const { mutate: handleAddLike } = useMutation({
    mutationKey: addLike.key,
    mutationFn: () => addLike.fn({ postId }),
    onMutate: () => setIsOptimisticallyLiked(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getLoggedInUserLikeByPostId(postId).key });
      queryClient.invalidateQueries({ queryKey: getLikesCountByPostId(postId).key });
    },
    onError: () => setIsOptimisticallyLiked(false),
    meta: { disableLoadingDefault: true },
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
            <EditIcon color="primary" className={styles.editIcon} onClick={onUpdatePost} />
            <DeleteIcon
              color="error"
              className={styles.deleteIcon}
              onClick={() =>
                deletePost.fn(postId).then(() => queryClient.invalidateQueries({ queryKey: getLoggedInUserPosts.key }))
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
          <div className={styles.buttonWithCount}>
            <ThumbUpIcon
              className={`${styles.lowerIconButton} ${(isPostLikedByUser || !isReadOnly) && styles.disabledButton}`}
              color={isPostLikedByUser ? "error" : "action"}
              onClick={() => !isPostLikedByUser && handleAddLike()}
            />
            {likesCountObject?.count}
          </div>
          <div
            className={`${styles.buttonWithCount} ${styles.lowerIconButton} ${commentsCountObject?.count === 0 && styles.disabledButton}`}
            onClick={onViewComments}
          >
            <CommentIcon color="primary" />
            {commentsCountObject?.count}
          </div>
          {isReadOnly && (
            <div className={styles.lowerIconButton}>
              <AddCommentIcon color="success" onClick={onAddComment} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
