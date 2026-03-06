import { Box, Snackbar, Alert } from "@mui/material";
import ChatBot from "../components/Chatbot";
import { useState } from "react";
import { showNotificationClientDef, type ShowNotificationInput } from "@food-trek/schemas";

export default function ChatPage() {
  const [notification, setNotification] = useState<ShowNotificationInput | null>(null);

  const showNotification = showNotificationClientDef.client((input) => {
    setNotification(input as ShowNotificationInput);
    return { shown: true };
  });

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 6,
        px: 30,
      }}
    >
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
}
