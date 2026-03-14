import { Button, Modal, TextField } from "@mui/material";
import { createNewPost } from "../../api/postsApi";
import styles from "./add-post-modal.module.css";
import { useState } from "react";
import { uploadFile } from "../../api/filesApi";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddPostModal: React.FC<Props> = ({ isModalOpen, setIsModalOpen }) => {
  const [postText, setPostText] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);

  const imagePreview = postImageFile ? URL.createObjectURL(postImageFile) : null;

  const handleOnClose = () => {
    setIsModalOpen(false);
    setPostText(null);
    setPostImageFile(null);
  };

  return (
    <Modal open={isModalOpen} onClose={handleOnClose}>
      <div className={styles.modalContent}>
        <div className={styles.imagePreviewContainer}>
          {imagePreview ? (
            <img src={imagePreview} className={styles.previewImage} />
          ) : (
            <div className={styles.placeholder}>No Image Selected</div>
          )}
        </div>
        <div className={styles.imagePreviewButton}>
          <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
            {!imagePreview ? "Upload Image" : "Update Image"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setPostImageFile(e.target.files?.[0] || null)}
            />
          </Button>
        </div>
        <div className={styles.postTextInput}>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            placeholder="Enter your text here..."
            value={postText || ""}
            onChange={(e) => setPostText(e.target.value)}
          />
        </div>
        <Button
          variant="contained"
          color="success"
          disabled={!postImageFile || !postText || postText === ""}
          sx={{ textTransform: "none" }}
          onClick={async () => {
            if (postImageFile && postText) {
              const { url: imageUrl } = await uploadFile.fn(postImageFile);

              createNewPost.fn({ imageUrl, text: postText }).then(() => handleOnClose());
            }
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};
