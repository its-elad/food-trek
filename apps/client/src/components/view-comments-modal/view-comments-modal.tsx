import { Avatar, Modal, Typography } from "@mui/material";
import styles from "./view-comments-modal.module.css";
import { useQuery } from "@tanstack/react-query";
import { getCommentsByPostId } from "../../api/commentsApi";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  postId: string;
}

export const ViewCommentsModal: React.FC<Props> = ({ isModalOpen, setIsModalOpen, postId }) => {
  const { data: commentsData } = useQuery({
    queryKey: getCommentsByPostId(postId).key,
    queryFn: getCommentsByPostId(postId).fn,
  });

  return (
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <div className={styles.modalContent}>
        {commentsData?.map(({ _id: commentId, userId: { username, imgUrl: userProfileImage }, text: postText }) => (
          <div key={commentId} className={styles.comment}>
            <Avatar src={userProfileImage} />
            <div className={styles.commentBubble}>
              <Typography variant="subtitle2" fontWeight="bold">
                {username}
              </Typography>
              <Typography variant="body2">{postText}</Typography>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
