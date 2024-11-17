import { Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { Paper } from "@mui/material";

import classes from "./index.module.css";
import AppMargin from "../../components/AppMargin";
import {
  COLLABORATIVE_EDITOR_PATH,
  FIND_MATCH_FORM_PATH,
  MATCH_FOUND_PATH,
  QUESTIONS_LIST_PATH,
} from "../../utils/constants";

const Landing: React.FC = () => {
  const images = [
    {
      name: "Questions list",
      path: QUESTIONS_LIST_PATH,
    },
    {
      name: "Find match form",
      path: FIND_MATCH_FORM_PATH,
    },
    {
      name: "Match found",
      path: MATCH_FOUND_PATH,
    },
    {
      name: "Collaborative editor",
      path: COLLABORATIVE_EDITOR_PATH,
    },
  ];

  return (
    <AppMargin
      classname={`${classes.fullheight} ${classes.center} ${classes.margins}`}
    >
      <Typography
        component={"h1"}
        variant="h1"
        textAlign={"center"}
        sx={(theme) => ({
          fontWeight: "bold",
          color: "primary.main",
          marginBottom: theme.spacing(4),
        })}
      >
        Level up in your technical interviews!
      </Typography>

      <Typography
        variant="subtitle1"
        textAlign={"center"}
        sx={(theme) => ({
          fontSize: "h5.fontSize",
          marginBottom: theme.spacing(4),
          maxWidth: "80%",
        })}
      >
        Your ultimate technical interview preparation platform to practice
        whiteboard style interview questions with a peer.
      </Typography>

      <Carousel
        sx={{ width: "600px" }}
        height={400}
        navButtonsAlwaysInvisible
        stopAutoPlayOnHover={false}
      >
        {images.map((image, i) => (
          <Paper key={i} elevation={2}>
            <img src={image.path} alt={image.name} />
          </Paper>
        ))}
      </Carousel>
    </AppMargin>
  );
};

export default Landing;
