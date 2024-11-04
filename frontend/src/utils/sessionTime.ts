export const extractHoursFromTime = (time: number) => Math.floor(time / 3600);

export const extractMinutesFromTime = (time: number) =>
  Math.floor((time % 3600) / 60); // after extracting hours

export const extractSecondsFromTime = (time: number) => time % 60; // after extracting hours and minutes

export const extractMinutesOnly = (time: number) => time / 60;

export const convertDateString = (date: string): string => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
