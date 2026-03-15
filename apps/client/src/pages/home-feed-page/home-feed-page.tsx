import { useQuery } from "@tanstack/react-query";
import { getHomeFeedPosts } from "../../api/postsApi";
import { Button } from "@mui/material";
import styles from "./home-feed-page.module.css";
import { useState } from "react";
import { Post, AddPostModal } from "../../components";

export const HomeFeedPage: React.FC = () => {
  const { data: homeFeedPosts } = useQuery({
    queryKey: getHomeFeedPosts.key,
    queryFn: getHomeFeedPosts.fn,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <AddPostModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};
