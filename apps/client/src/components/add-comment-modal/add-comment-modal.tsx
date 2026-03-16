import { Button, Modal, TextField } from "@mui/material";
import styles from "./add-comment-modal.module.css";
import { useState } from "react";
import { addComment } from "../../api/commentsApi";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  postId: string;
}

export const AddCommentModal: React.FC<Props> = ({ isModalOpen, setIsModalOpen, postId }) => {
  const [commentText, setCommentPostText] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const handleOnClose = () => {
    setIsModalOpen(false);
    setCommentPostText(null);

    queryClient.invalidateQueries({ queryKey: ["comments", postId, "count"] });
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
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
