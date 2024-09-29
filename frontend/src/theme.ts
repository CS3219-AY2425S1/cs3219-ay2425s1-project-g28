import grey from "@mui/material/colors/grey";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#8FB8ED", contrastText: "#FFFFFF" },
    secondary: { main: "#ECECEC", contrastText: "#757575" },
    error: { main: "#D33737" },
    success: { main: "#35B25D" },
    common: { white: "#FFFFFF", black: "#2F2F2F" },
  },
  typography: {
    h1: { fontWeight: 600, fontSize: "36px" },
    h2: { fontWeight: 600, fontSize: "32px" },
    h3: { fontWeight: 600, fontSize: "28px" },
    h4: { fontWeight: 600, fontSize: "24px" },
    h5: { fontWeight: 600, fontSize: "20px" },
    h6: { fontWeight: 600, fontSize: "16px" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          "& ::-webkit-scrollbar": {
            height: "6px",
            width: "6px",
          },
          "& ::-webkit-scrollbar-track": {
            backgroundColor: grey[200],
          },
          "& ::-webkit-scrollbar-thumb": {
            backgroundColor: grey[400],
          },
          "& ::-webkit-scrollbar-thumb:hover": {
            backgroundColor: grey[500],
          },
        },
      },
    },
  },
});

export default theme;
