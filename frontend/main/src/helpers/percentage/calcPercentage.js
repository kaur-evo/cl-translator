export default function calcPercentage(obj, fractionKey, totalKey) {
  if (!fractionKey) throw new Error('calcPercentage requires a fractionKey');
  if (!totalKey) throw new Error('calcPercentage requires a totalKey');
  if (!(fractionKey in obj)) throw new Error('calcPercentage requires a fractionKey that exists in the object');
  if (!(totalKey in obj)) throw new Error('calcPercentage requires a totalKey that exists in the object');
  if (!obj[totalKey]) return 0;
  return (obj[fractionKey] / obj[totalKey]) || 0;
}
