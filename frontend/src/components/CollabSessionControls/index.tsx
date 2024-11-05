import { Button, Stack } from "@mui/material";
import Stopwatch from "../Stopwatch";
import { useCollab } from "../../contexts/CollabContext";
import { USE_COLLAB_ERROR_MESSAGE } from "../../utils/constants";
import { useEffect, useState } from "react";

const CollabSessionControls: React.FC = () => {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(
      () => setTime((prevTime) => prevTime + 1),
      1000
    );

    return () => clearInterval(intervalId);
  }, [time]);

  const collab = useCollab();
  if (!collab) {
    throw new Error(USE_COLLAB_ERROR_MESSAGE);
  }

  const { handleSubmitSessionClick, handleEndSessionClick } = collab;

  return (
    <Stack direction={"row"} alignItems={"center"} spacing={2}>
      <Stopwatch time={time} />
      <Button
        sx={{
          border: 1.5,
          borderRadius: 4,
        }}
        variant="outlined"
        color="success"
        onClick={() => handleSubmitSessionClick(time)}
      >
        Submit
      </Button>
      <Button
        sx={{
          border: 1.5,
          borderRadius: 4,
        }}
        variant="outlined"
        color="error"
        onClick={() => {
          handleEndSessionClick();
        }}
      >
        End Session
      </Button>
    </Stack>
  );
};

export default CollabSessionControls;
