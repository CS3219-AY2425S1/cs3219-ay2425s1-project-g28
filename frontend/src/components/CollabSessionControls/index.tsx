import { Button, Stack } from "@mui/material";
import Stopwatch from "../Stopwatch";
import { useMatch } from "../../contexts/MatchContext";
import { USE_MATCH_ERROR_MESSAGE } from "../../utils/constants";
import { useEffect, useState } from "react";
import {
  extractHoursFromTime,
  extractMinutesFromTime,
  extractSecondsFromTime,
} from "../../utils/sessionTime";
import { getDocumentContent } from "../../utils/collabSocket";

const CollabSessionControls: React.FC = () => {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(
      () => setTime((prevTime) => prevTime + 1),
      1000
    );

    return () => clearInterval(intervalId);
  }, [time]);

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const { handleEndSessionClick } = match;

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
        onClick={() => {
          console.log(
            `Time taken: ${extractHoursFromTime(
              time
            )} hrs ${extractMinutesFromTime(
              time
            )} mins ${extractSecondsFromTime(time)} secs`
          );
          console.log(`Code: ${getDocumentContent()}`);
        }} // TODO: implement submit function with time taken pop-up
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
        onClick={() => handleEndSessionClick()}
      >
        End Session
      </Button>
    </Stack>
  );
};

export default CollabSessionControls;
