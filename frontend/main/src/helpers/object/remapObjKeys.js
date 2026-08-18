export default function remapObjKeys(obj, keysMap) {
  if (keysMap === undefined || keysMap.length === 0) return obj;
  const objCopy = { ...obj };
  keysMap.forEach(([sourceKey, destinationkey]) => {
    objCopy[destinationkey] = objCopy[sourceKey];
  });
  return objCopy;
}
