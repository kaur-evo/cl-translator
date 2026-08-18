export default function setUnion(...iterables) {
  const set = new Set();
  for (let iterIdx = 0; iterIdx < iterables.length; iterIdx += 1) {
    const iterable = iterables[iterIdx];

    for (const item of iterable) { // for-of is the most performant way of iterating through Set
      set.add(item);
    }
  }
  return set;
}
