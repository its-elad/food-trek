import { useQuery } from "@tanstack/react-query";
import { getHomeFeedPosts } from "../../api/postsApi";
import { Button } from "@mui/material";
import styles from "./home-feed-page.module.css";
import { useState } from "react";
import { Post, AddOrUpdatePostModal } from "../../components";

export const HomeFeedPage: React.FC = () => {
  const { data: homeFeedPosts } = useQuery({
    queryKey: getHomeFeedPosts.key,
    queryFn: getHomeFeedPosts.fn,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.homeFeedPosts}>
        {homeFeedPosts && homeFeedPosts.map((postData) => <Post key={postData._id} postData={postData} />)}
      </div>
      <div className={styles.addPostButton}>
        <Button variant="contained" color="success" onClick={() => setIsModalOpen(true)} sx={{ textTransform: "none" }}>
          Add Post
        </Button>
      </div>
      <AddOrUpdatePostModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};
