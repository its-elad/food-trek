import { Button, Modal, TextField } from "@mui/material";
import { createNewPost, getLoggedInUserPosts, updatePost } from "../../api/postsApi";
import styles from "./add-or-update-post-modal.module.css";
import { useEffect, useState } from "react";
import { uploadFile } from "../../api/filesApi";
import type { PostData } from "@food-trek/schemas";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isModalOpen: boolean;
  onClose: () => void;
  postData?: PostData;
}

export const AddOrUpdatePostModal: React.FC<Props> = ({ isModalOpen, onClose, postData }) => {
  const isUpdateMode = !!postData;

  const [postText, setPostText] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);

  const imagePreview = postImageFile ? URL.createObjectURL(postImageFile) : isUpdateMode ? postData.imageUrl : null;

  useEffect(() => {
    if (isModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPostText(isUpdateMode ? postData.text : null);
    }
  }, [isModalOpen, isUpdateMode, postData]);

  const queryClient = useQueryClient();

  const handleOnClose = () => {
    onClose();
    setPostImageFile(null);
    queryClient.invalidateQueries({ queryKey: getLoggedInUserPosts.key });
  };

  const isSaveButtonDisabledInUpdateMode = (!postImageFile && postText === postData?.text) || postText === "";
  const isSaveButtonDisabledInAddMode = !postImageFile || !postText || postText === "";

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
          disabled={isUpdateMode ? isSaveButtonDisabledInUpdateMode : isSaveButtonDisabledInAddMode}
          sx={{ textTransform: "none" }}
          onClick={async () => {
            if (isUpdateMode && postText) {
              if (postImageFile) {
                const { url: imageUrl } = await uploadFile.fn(postImageFile);

                updatePost
                  .fn(postData._id, { imageUrl, text: postText !== postData.text ? postText : undefined })
                  .then(() => handleOnClose());
              } else {
                updatePost.fn(postData._id, { text: postText }).then(() => handleOnClose());
              }
            } else if (postImageFile && postText) {
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
