import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme.ts";
import { LoadingProvider } from "./contexts/LoadingContext.tsx";
import { QueryClientWrapper } from "./contexts/QueryClientWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <LoadingProvider>
        <QueryClientWrapper>
          <CssBaseline />
          <App />
        </QueryClientWrapper>
      </LoadingProvider>
    </ThemeProvider>
  </StrictMode>
);
