import { Box, Typography } from "@mui/material";
import AppMargin from "../AppMargin";
import classes from "./index.module.css";

type ErrorProps = { title: string; subtitle: string };

const Error: React.FC<ErrorProps> = (props) => {
  const { title, subtitle } = props;

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.center}`}>
      <Box>
        <Typography
          component={"h1"}
          variant="h3"
          textAlign={"center"}
          sx={(theme) => ({ marginBottom: theme.spacing(4) })}
        >
          {title}
        </Typography>
        <Typography textAlign={"center"}>{subtitle}</Typography>
      </Box>
    </AppMargin>
  );
};

export default Error;
