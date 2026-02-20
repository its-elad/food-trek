import { Box, Button, Typography, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext.js';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Avatar src={user?.imgUrl ?? undefined} sx={{ width: 100, height: 100 }} />
      <Typography variant="h4" fontWeight={700}>
        Welcome, {user?.username ?? 'User'}!
      </Typography>
      <Typography color="text.secondary">{user?.email}</Typography>
      <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
        Sign Out
      </Button>
    </Box>
  );
}
