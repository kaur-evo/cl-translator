export default (weekday) => {
  let weekdayNumber = Number(weekday);
  if (Number.isNaN(weekdayNumber) || weekdayNumber < 0 || weekdayNumber > 7) {
    throw new Error(`Invalid weekday number: ${weekdayNumber}. It should be between 0 (Sunday) and 7 (Sunday).`);
  }

  const today = new Date();
  const currentDay = today.getDay();
  if (weekdayNumber === 7) {
    weekdayNumber = 0;
  }
  const diff = (weekdayNumber - currentDay + 7) % 7;

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);

  return targetDate;
};
