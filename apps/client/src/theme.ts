import { createTheme } from "@mui/material";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data",
  },
  colorSchemes: {
    light: {
      palette: {
        // mode: "light",
        primary: {
          main: "#1976d2",
        },
        secondary: {
          main: "#9c27b0",
        },
      },
    },
    dark: {
      palette: {
        // mode: "dark",
        primary: {
          main: "#90caf9",
        },
        secondary: {
          main: "#ce93d8",
        },
      },
    },
  },
});

export default theme;
