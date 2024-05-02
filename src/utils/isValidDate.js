// Function to validate date format
export function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}
