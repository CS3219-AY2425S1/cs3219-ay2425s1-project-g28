import {
  extractHoursFromTime,
  extractMinutesFromTime,
  extractSecondsFromTime,
} from "../../utils/sessionTime";

interface StopwatchProps {
  time: number;
}

const Stopwatch: React.FC<StopwatchProps> = (props) => {
  const { time } = props;

  const hours = extractHoursFromTime(time);
  const minutes = extractMinutesFromTime(time);
  const seconds = extractSecondsFromTime(time);

  return (
    <div>
      <p style={{ color: "black", fontWeight: "bold" }}>
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default Stopwatch;
