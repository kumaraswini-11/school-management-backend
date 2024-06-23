export const validatePaginationParams = (page, limit) => {
  const isValid = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;
  return isValid;
};
