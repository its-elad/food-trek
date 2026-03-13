import { useQuery } from "@tanstack/react-query";
import { createNewPost, getHomeFeedPosts } from "../../api/postsApi";
import { Button, Modal, TextField } from "@mui/material";
import styles from "./home-feed-page.module.css";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { uploadFile } from "../../api/filesApi";
import { Post } from "../../components";

export const HomeFeedPage: React.FC = () => {
  const { user: loggedInUser } = useAuth();

  if (!loggedInUser) {
    return null;
  }

  const loggedInUserId = loggedInUser._id;

  const { data: homeFeedPosts } = useQuery({
    queryKey: getHomeFeedPosts(loggedInUserId).key,
    queryFn: getHomeFeedPosts(loggedInUserId).fn,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);

  const imagePreview = postImageFile ? URL.createObjectURL(postImageFile) : null;

  const handleOnClose = () => {
    setIsModalOpen(false);
    setPostText(null);
    setPostImageFile(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.homeFeedPosts}>
        {homeFeedPosts &&
          homeFeedPosts.map((postData) => (
            <div className={styles.post} key={postData._id}>
              <Post postData={postData} />
            </div>
          ))}
      </div>
      <div className={styles.addPostButton}>
        <Button variant="contained" color="success" onClick={() => setIsModalOpen(true)} sx={{ textTransform: "none" }}>
          Add Post
        </Button>
      </div>
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

                createNewPost.fn({ userId: loggedInUserId, imageUrl, text: postText }).then(() => handleOnClose());
              }
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
};
