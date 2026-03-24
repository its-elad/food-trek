import { useQuery } from "@tanstack/react-query";
import { getHomeFeedPosts } from "../../api/postsApi";
import { Button, TextField } from "@mui/material";
import styles from "./home-feed-page.module.css";
import { useState } from "react";
import { Post, AddOrUpdatePostModal, ViewCommentsModal, AddCommentModal } from "../../components";

export const HomeFeedPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewCommentsModalPostId, setViewCommentsModalPostId] = useState<string | null>(null);
  const [addCommentModalPostId, setAddCommentModalPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data: homeFeedPosts } = useQuery({
    queryKey: getHomeFeedPosts(searchQuery).key,
    queryFn: getHomeFeedPosts(searchQuery).fn,
  });

  return (
    <div className={styles.pageContainer}>
      <form
        className={styles.searchContainer}
        onSubmit={(event) => {
          event.preventDefault();
          setSearchQuery(event.target?.search?.value?.trim() || null);
        }}
      >
        <TextField
          name="search"
          placeholder="Search posts..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ maxWidth: "300px" }}
        />
        <Button type="submit" variant="contained" sx={{ textTransform: "none" }}>
          Search
        </Button>
      </form>
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
        <Button variant="contained" color="success" onClick={() => setIsModalOpen(true)} sx={{ textTransform: "none" }}>
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
  );
};
