export default function getObjVal(key, obj) {
  if (obj?.has) {
    let k = key;
    if (key < 0) {
      k = `${key}`; // js Map cant have negative numeric keys which are converted to string
    }
    return obj.get(k) || null;
  }
  if (obj?.[key]) {
    return obj[key];
  }
  return null;
}
