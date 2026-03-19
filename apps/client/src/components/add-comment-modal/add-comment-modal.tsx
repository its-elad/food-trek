import { Button, Modal, TextField } from "@mui/material";
import styles from "./add-comment-modal.module.css";
import { useState } from "react";
import { addComment, getCommentsByPostId, getCommentsCountByPostId } from "../../api/commentsApi";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isModalOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export const AddCommentModal: React.FC<Props> = ({ isModalOpen, onClose, postId }) => {
  const queryClient = useQueryClient();

  const [commentText, setCommentPostText] = useState<string | null>(null);

  if (!postId) {
    return null;
  }

  const handleOnClose = () => {
    onClose();
    setCommentPostText(null);

    queryClient.invalidateQueries({ queryKey: getCommentsCountByPostId(postId).key });
    queryClient.invalidateQueries({ queryKey: getCommentsByPostId(postId).key });
  };

  return (
    <Modal open={isModalOpen} onClose={handleOnClose}>
      <div className={styles.modalContent}>
        <div className={styles.commentTextInput}>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            placeholder="Enter your text here..."
            value={commentText || ""}
            onChange={(e) => setCommentPostText(e.target.value)}
          />
        </div>
        <Button
          variant="contained"
          color="success"
          disabled={!commentText || commentText === ""}
          sx={{ textTransform: "none" }}
          onClick={async () => {
            if (commentText) {
              addComment.fn({ postId, text: commentText }).then(() => handleOnClose());
            }
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};
