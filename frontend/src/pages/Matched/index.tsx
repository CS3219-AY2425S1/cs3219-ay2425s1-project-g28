import AppMargin from "../../components/AppMargin";
import {
  Avatar,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import classes from "./index.module.css";
import { useMatch } from "../../contexts/MatchContext";
import {
  MATCH_OFFER_TIMEOUT_MESSAGE,
  MATCH_UNSUCCESSFUL_MESSAGE,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { CheckCircleOutlineRounded } from "@mui/icons-material";

const acceptanceTimeout = 15;

const Matched: React.FC = () => {
  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const {
    matchOfferTimeout,
    acceptMatch,
    rematch,
    matchUser,
    partner,
    matchPending,
    loading,
  } = match;

  const [timeLeft, setTimeLeft] = useState<number>(acceptanceTimeout);
  const [accepted, setAccepted] = useState<boolean>(false);

  useEffect(() => {
    const startTime = new Date().getTime();
    const endTime = startTime + acceptanceTimeout * 1000;

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = Math.max(0, (endTime - currentTime) / 1000);
      setTimeLeft(remainingTime);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (accepted) {
        toast.error(MATCH_UNSUCCESSFUL_MESSAGE);
      } else {
        toast.error(MATCH_OFFER_TIMEOUT_MESSAGE);
      }
      matchOfferTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (!matchUser || !partner) {
    return <Navigate to="/home" replace />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.center}`}>
      <Stack spacing={2} alignItems={"center"}>
        <Typography variant="h1">It's a match!</Typography>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          paddingTop={2}
          paddingBottom={2}
        >
          <Avatar src={matchUser.profile} sx={{ width: 120, height: 120 }} />

          <Box
            sx={(theme) => ({
              width: "120px",
              height: "2px",
              backgroundColor: theme.palette.secondary.contrastText,
              margin: "0 10px",
            })}
          />

          <Avatar src={partner.profile} sx={{ width: 120, height: 120 }} />
        </Box>

        <Typography variant="h3">Practice with @{partner.username}?</Typography>

        <Box sx={{ width: "100%" }}>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / acceptanceTimeout) * 100}
          />
        </Box>

        <Stack spacing={2} direction="row" paddingTop={2} width={700}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            disabled={matchPending && accepted}
            onClick={rematch}
          >
            Rematch
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={!matchPending || accepted}
            onClick={() => {
              acceptMatch();
              setAccepted(true);
            }}
            endIcon={accepted ? <CheckCircleOutlineRounded /> : null}
          >
            {accepted ? "Accepted" : "Accept"}
          </Button>
        </Stack>
      </Stack>
    </AppMargin>
  );
};

export default Matched;
