import { CardHeader, Avatar, Typography, CardContent } from "@mui/material";
import styles from "./post.module.css";
import type { PostData } from "@food-trek/schemas";

interface Props {
  postData: PostData;
}

export const Post: React.FC<Props> = ({ postData }) => {
  const {
    userId: { username, imgUrl: userProfileImage },
    imageUrl: postImage,
    text: postText,
  } = postData;

  return (
    <div className={styles.postContainer}>
      <CardHeader
        avatar={<Avatar src={userProfileImage} className={styles.profileImage} />}
        title={<Typography fontWeight="bold">{username}</Typography>}
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
