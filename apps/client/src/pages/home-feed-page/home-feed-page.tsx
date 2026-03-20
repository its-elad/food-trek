import { useQuery } from "@tanstack/react-query";
import { getHomeFeedPosts } from "../../api/postsApi";
import { Button } from "@mui/material";
import styles from "./home-feed-page.module.css";
import { useState } from "react";
import { Post, AddOrUpdatePostModal, ViewCommentsModal, AddCommentModal, Navbar } from "../../components";

export const HomeFeedPage: React.FC = () => {
  const { data: homeFeedPosts } = useQuery({
    queryKey: getHomeFeedPosts.key,
    queryFn: getHomeFeedPosts.fn,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewCommentsModalPostId, setViewCommentsModalPostId] = useState<string | null>(null);
  const [addCommentModalPostId, setAddCommentModalPostId] = useState<string | null>(null);

  return (
    <div className={styles.screenContainer}>
      <div className={styles.navbar}>
        <Navbar />
      </div>
      <div className={styles.pageContainer}>
        <div className={styles.homeFeedPosts}>
          {homeFeedPosts &&
            homeFeedPosts.map((postData) => (
              <Post
                key={postData._id}
                postData={postData}
                onViewComments={() => setViewCommentsModalPostId(postData._id)}
                onAddComment={() => setAddCommentModalPostId(postData._id)}
              />
            ))}
        </div>
        <div className={styles.addPostButton}>
          <Button
            variant="contained"
            color="success"
            onClick={() => setIsModalOpen(true)}
            sx={{ textTransform: "none" }}
          >
            Add Post
          </Button>
        </div>
        <AddOrUpdatePostModal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <ViewCommentsModal
          isModalOpen={!!viewCommentsModalPostId}
          onClose={() => setViewCommentsModalPostId(null)}
          postId={viewCommentsModalPostId}
        />
        <AddCommentModal
          isModalOpen={!!addCommentModalPostId}
          onClose={() => setAddCommentModalPostId(null)}
          postId={addCommentModalPostId}
        />
      </div>
    </div>
  );
};
