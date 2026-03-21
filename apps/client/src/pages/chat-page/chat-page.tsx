import { Box, Snackbar, Alert } from "@mui/material";
import ChatBot from "../../components/Chatbot";
import { useState } from "react";
import { showNotificationClientDef, type ShowNotificationInput } from "@food-trek/schemas";
import styles from "./chat-page.module.css";

export const ChatPage: React.FC = () => {
  const [notification, setNotification] = useState<ShowNotificationInput | null>(null);

  const showNotification = showNotificationClientDef.client((input) => {
    setNotification(input as ShowNotificationInput);
    return { shown: true };
  });

  return (
    <Box sx={{ py: 6, px: 30 }} className={styles.pageContainer}>
      <Snackbar
        open={!!notification}
        autoHideDuration={8000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ minWidth: "20vw" }}>
          {notification?.message}
        </Alert>
      </Snackbar>
      <ChatBot tools={[showNotification]} />
    </Box>
  );
};
