import { CardHeader, Avatar, Typography, CardContent } from "@mui/material";
import type { PostData } from "../../api/postsApi";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../../api/usersApi";
import styles from "./post.module.css";

interface Props {
  postData: PostData;
}

export const Post: React.FC<Props> = ({ postData }) => {
  const { userId, imageUrl: postImage, text: postText } = postData;

  const { data: userData } = useQuery({
    queryKey: getUserById(userId).key,
    queryFn: getUserById(userId).fn,
  });

  return (
    <div className={styles.postContainer}>
      <CardHeader
        avatar={<Avatar src={userData?.imgUrl} className={styles.profileImage} />}
        title={<Typography fontWeight="bold">{userData?.username}</Typography>}
      />
      <img src={postImage} className={styles.postImage} />
      <CardContent>
        <Typography variant="body2" color="text.primary">
          {postText}
        </Typography>
      </CardContent>
    </div>
  );
};
