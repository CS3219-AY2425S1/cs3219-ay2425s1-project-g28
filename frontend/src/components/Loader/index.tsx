import { Box, CircularProgress, Typography } from "@mui/material";

const Loader: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: "755px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress color="primary" size="80px" />
      <Typography
        variant="h4"
        sx={(theme) => ({ marginTop: theme.spacing(2) })}
      >
        Loading...
      </Typography>
    </Box>
  );
};

export default Loader;
