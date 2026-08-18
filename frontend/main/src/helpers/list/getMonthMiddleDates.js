export default (dates) => {
  const datesMapByMonth = dates.reduce((acc, date) => {
    const month = date.substring(0, 7);
    if (acc[month]) acc[month].push(date);
    else acc[month] = [date];
    return acc;
  }, {});
  if (Object.keys(datesMapByMonth).length <= 1) return []; // do not show when only one month is visible
  const middleDates = Object.values(datesMapByMonth).reduce((acc, monthDateArray) => {
    if (monthDateArray.length > 5) { // don't show value when there are less than 5 days per month visible
      const middleValueIndex = Math.floor(monthDateArray.length / 2);
      acc.push(monthDateArray[middleValueIndex]);
    }
    return acc;
  }, []);
  return middleDates;
};
