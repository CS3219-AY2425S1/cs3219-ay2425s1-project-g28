import React, { useEffect } from "react";
import AppMargin from "../../components/AppMargin";
import { Stack, Typography } from "@mui/material";
import matching from "../../assets/matching.svg";
import classes from "./index.module.css";
import Timer from "../../components/Timer";

const Matching: React.FC = () => {
  const totalTime = 30;
  const [timeLeft, setTimeLeft] = React.useState(totalTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime <= 0 ? 0 : prevTime - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.center}`}>
      <Stack spacing={2} alignItems={"center"}>
        <Typography component={"h1"} variant="h3">
          Finding your practice partner
        </Typography>
        <img src={matching} style={{ height: 120, width: "auto" }} />
        <Timer
          totalTime={totalTime}
          timeLeft={timeLeft}
          thickness={4.8}
          size={120}
        />
      </Stack>
    </AppMargin>
  );
};

export default Matching;
