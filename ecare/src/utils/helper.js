import dayjs from "dayjs";

export const addMinutes = (dateString, minutesToAdd) => {
  // Parse the date string
  const originalDate = dayjs(dateString);

  // Add minutes
  const updatedDate = originalDate.add(minutesToAdd, "minute");

  // Return the updated date as a string
  return updatedDate.format(); // You can also specify a format like 'YYYY-MM-DDTHH:mm:ss'
};

export const calculateAge = (dateOfBirth) => {
  return dayjs().diff(dayjs(dateOfBirth), "year");
};
