export function passContext(context, instance, keys = []) {
  keys.forEach((key) => {
    if (context[key] === undefined) throw new Error(`${key} is not defined in context`);
    Object.assign(instance, { [key]: context[key] });
  });
}

export function setContextKey(context, key, val) {
  if (context[key] === undefined) throw new Error(`${key} is not defined in context`);
  // eslint-disable-next-line no-param-reassign
  context[key] = val;
}
