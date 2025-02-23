const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Load the UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Merges an appointment date and time slot into a single ISO date string.
 *
 * @param {string} appointmentDate - The base appointment date (ISO string).
 * @param {string} timeSlot - The time slot to merge (e.g., '10:00 AM').
 * @returns {string} The merged date as an ISO string.
 */
const mergeDateAndTime = (appointmentDate, timeSlot) => {
  // Parse the appointment date as UTC
  const date = dayjs.utc(appointmentDate);

  // Split the time slot to extract hours and minutes
  const [time, modifier] = timeSlot.split(" "); // Split '10:00 AM' into ['10:00', 'AM']
  let [hours, minutes] = time.split(":").map(Number); // Split '10:00' into [10, 0]

  // Adjust hours based on AM/PM
  if (modifier === "PM" && hours < 12) {
    hours += 12; // Convert to 24-hour format for PM
  } else if (modifier === "AM" && hours === 12) {
    hours = 0; // Midnight case
  }

  // Set the hours and minutes to the date in UTC
  const updatedDate = date
    .set("hour", hours)
    .set("minute", minutes)
    .set("second", 0)
    .set("millisecond", 0);

  // Return the updated date as a string in UTC
  return updatedDate.format("YYYY-MM-DDTHH:mm:ss"); // Or use updatedDate.format('YYYY-MM-DDTHH:mm:ss') for custom formatting
};

module.exports = { mergeDateAndTime };
