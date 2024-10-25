import AppMargin from "../../components/AppMargin";
import { Button, Stack, Typography } from "@mui/material";
import classes from "./index.module.css";
import { useMatch } from "../../contexts/MatchContext";
import { USE_MATCH_ERROR_MESSAGE } from "../../utils/constants";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import ServerError from "../../components/ServerError";

const CollabSandbox: React.FC = () => {
  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const { stopMatch, verifyMatchStatus, getMatchId, partner, loading } = match;

  useEffect(() => {
    verifyMatchStatus();

    // TODO
    // connect to collab service using getMatchId()
    console.log(getMatchId());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!partner) {
    return (
      <ServerError
        title="Oops, match ended..."
        subtitle="Unfortunately, the match has ended due to a connection loss 😥"
      />
    );
  }

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.center}`}>
      <Stack spacing={2} alignItems={"center"}>
        <Typography variant="h1">Successfully matched!</Typography>
        <Button variant="outlined" color="error" onClick={() => stopMatch()}>
          End Session
        </Button>
      </Stack>
    </AppMargin>
  );
};

export default CollabSandbox;
