import React, { useEffect, useState } from "react";
import AppMargin from "../../components/AppMargin";
import { Stack, Typography } from "@mui/material";
import matching from "../../assets/matching.svg";
import classes from "./index.module.css";
import Timer from "../../components/Timer";
import { useMatch } from "../../contexts/MatchContext";
import {
  MIN_MATCH_TIMEOUT,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import { Navigate } from "react-router-dom";

const Matching: React.FC = () => {
  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const { matchingTimeout, matchCriteria } = match;
  const timeout = matchCriteria?.timeout || MIN_MATCH_TIMEOUT;

  const [timeLeft, setTimeLeft] = useState<number>(timeout);

  useEffect(() => {
    const startTime = new Date().getTime();
    const endTime = startTime + timeout * 1000;

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = Math.max(
        0,
        Math.round((endTime - currentTime) / 1000)
      );
      setTimeLeft(remainingTime);
    });

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      matchingTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (!matchCriteria) {
    return <Navigate to="/home" replace />;
  }

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.center}`}>
      <Stack spacing={2} alignItems={"center"}>
        <Typography component={"h1"} variant="h3">
          Finding your practice partner
        </Typography>
        <img src={matching} style={{ height: 120, width: "auto" }} />
        <Timer
          totalTime={timeout}
          timeLeft={timeLeft}
          thickness={4.8}
          size={120}
        />
      </Stack>
    </AppMargin>
  );
};

export default Matching;
