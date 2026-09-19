export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 17;

export const getClockParts = (date) => ({
  hour: date.getHours(),
  minute: date.getMinutes(),
});

export const formatHoursRange = () => {
  const fmt = (h) => {
    const period = h < 12 ? "AM" : "PM";
    const hour = h % 12 || 12;
    return `${hour}:00 ${period}`;
  };
  return `${fmt(OPEN_HOUR)} – ${fmt(CLOSE_HOUR)}`;
};
