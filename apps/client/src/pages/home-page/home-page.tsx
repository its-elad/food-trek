import { Box, Button, Typography, Avatar } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext.js";
import styles from "./home-page.module.css";
import { Navbar } from "../../components";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className={styles.screenContainer}>
      <div className={styles.navbar}>
        <Navbar />
      </div>
      <Box className={styles.pageContainer}>
        <Avatar src={user?.imgUrl ?? undefined} sx={{ width: 100, height: 100 }} />
        <Typography variant="h4" fontWeight={700}>
          Welcome, {user?.username ?? "User"}!
        </Typography>
        <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2, textTransform: "none" }}>
          Sign Out
        </Button>
      </Box>
    </div>
  );
};
