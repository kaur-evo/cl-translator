/* ! fromentries. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
import { toRaw } from 'vue';

export default function fromEntries(iterable, options) {
  return [...iterable].reduce((_obj, [key, val]) => {
    const obj = { ..._obj };
    if (options?.toRaw) {
      obj[key] = toRaw(val);
    } else {
      obj[key] = val;
    }

    return obj;
  }, {});
}
