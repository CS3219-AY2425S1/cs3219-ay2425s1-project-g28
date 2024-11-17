import { Navigate, useNavigate } from "react-router-dom";
import AppMargin from "../../components/AppMargin";
import { Button, Stack, Typography } from "@mui/material";
import timeout from "../../assets/timeout.svg";
import classes from "./index.module.css";
import { useMatch } from "../../contexts/MatchContext";
import { USE_MATCH_ERROR_MESSAGE } from "../../utils/constants";

const Timeout: React.FC = () => {
  const navigate = useNavigate();

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const { retryMatch, matchCriteria } = match;

  if (!matchCriteria) {
    return <Navigate to="/home" replace />;
  }

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.center}`}>
      <Stack spacing={2} alignItems={"center"}>
        <Typography variant="h1">Oops, timeout...</Typography>

        <img src={timeout} style={{ height: 240, width: "auto" }} />

        <Typography variant="h3">
          Unfortunately, we could not find a match.
        </Typography>

        <Stack spacing={2} direction="row" paddingTop={2} width={700}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => navigate("/home", { replace: true })}
          >
            Exit
          </Button>
          <Button variant="contained" fullWidth onClick={retryMatch}>
            Try Again
          </Button>
        </Stack>
      </Stack>
    </AppMargin>
  );
};

export default Timeout;
