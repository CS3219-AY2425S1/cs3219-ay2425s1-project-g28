export const extractHoursFromTime = (time: number) => Math.floor(time / 3600);

export const extractMinutesFromTime = (time: number) =>
  Math.floor((time % 3600) / 60); // after extracting hours

export const extractSecondsFromTime = (time: number) => time % 60; // after extracting hours and minutes

export const convertDateString = (date: string): string => {
  const convertedDate = new Date(date);
  const dateString = convertedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timeString = convertedDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return dateString + "  " + timeString;
};
