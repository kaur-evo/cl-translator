export default function deleteObjKeys(obj, deleteKeys) {
  if (deleteKeys === undefined || deleteKeys.length === 0) return obj;
  const objCopy = { ...obj };
  deleteKeys.forEach((deleteKey) => {
    if (objCopy[deleteKey] !== undefined) {
      delete objCopy[deleteKey];
    }
  });
  return objCopy;
}
