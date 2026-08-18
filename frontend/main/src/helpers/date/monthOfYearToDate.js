export default (moyString) => {
  const yearNumber = Number(String(moyString).substring(0, 4));
  const monthNumber = Number(String(moyString).substring(4)) - 1;
  return new Date(yearNumber, monthNumber, 1, 0, 0, 0, 0);
};
