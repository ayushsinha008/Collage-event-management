export const formatLocalDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const sendResponse = (success: boolean, message: string, data?: any) => {
  return {
    success,
    message,
    data
  };
};
