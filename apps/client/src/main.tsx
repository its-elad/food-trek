import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme.ts";
import { LoadingProvider } from "./contexts/LoadingContext.tsx";
import { QueryClientWrapper } from "./contexts/QueryClientWrapper.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <LoadingProvider>
          <QueryClientWrapper>
            <AuthProvider>
              <CssBaseline />
              <App />
            </AuthProvider>
          </QueryClientWrapper>
        </LoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
