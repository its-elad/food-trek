import { createTheme } from "@mui/material";


const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#1976d2",
        },
        secondary: {
          main: "#9c27b0",
        },
        background: {
          default: "#f5f7fa", // modern, soft light background
          paper: "#ffffff",   // card/modal backgrounds
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#4f5b62",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#90caf9",
        },
        secondary: {
          main: "#ce93d8",
        },
        background: {
          default: "#181a1b", // modern, deep dark background
          paper: "#23272f",   // card/modal backgrounds
        },
        text: {
          primary: "#f5f7fa",
          secondary: "#b0b8c1",
        },
      },
    },
  },
});

export default theme;
