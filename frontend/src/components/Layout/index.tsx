import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: "755px",
        // minInlineSize: "100vw",
      }}
    >
      <Navbar />
      <Outlet />
      <ToastContainer position="bottom-right" />
    </Box>
  );
};

export default Layout;
