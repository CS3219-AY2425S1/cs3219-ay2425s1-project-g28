export const extractHoursFromTime = (time: number) => Math.floor(time / 3600);

export const extractMinutesFromTime = (time: number) =>
  Math.floor((time % 3600) / 60); // after extracting hours

export const extractSecondsFromTime = (time: number) => time % 60; // after extracting hours and minutes
