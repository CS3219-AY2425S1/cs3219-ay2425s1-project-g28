import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from "@mui/material";

type TimerProps = { totalTime: number; timeLeft: number };

const Timer: React.FC<CircularProgressProps & TimerProps> = (props) => {
  const { totalTime, timeLeft, thickness, size, ...rest } = props;
  const percentage = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedSeconds = String(seconds).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  return (
    <Box
      sx={{ position: "relative", display: "inline-flex" }}
      data-testid="timer"
    >
      <CircularProgress
        variant="determinate"
        size={size}
        value={100}
        sx={{ opacity: 0.4 }}
        thickness={thickness}
        {...rest}
      />
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={size}
        sx={{ position: "absolute" }}
        thickness={thickness}
        {...rest}
      />
      <Box
        sx={{
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {formattedMinutes}:{formattedSeconds}
        </Typography>
      </Box>
    </Box>
  );
};

export default Timer;
