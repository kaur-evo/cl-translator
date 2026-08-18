/* eslint-disable no-magic-numbers */

function isMultiValueKey(key) {
  return key.endsWith('[]');
}
const encodeReserveRE = /[!'()*]/g;
const encodeReserveReplacer = (c) => `%${c.charCodeAt(0).toString(16)}`;
const commaRE = /%2C/g;

function encode(str) {
  return encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ',');
}

function decode(encoded) {
  return decodeURIComponent(encoded.replace(/\+/g, ' '));
}

export default class UrlParams {
  constructor(input, options = { merge: false }) {
    if (typeof input === 'string' || typeof input === 'undefined') {
      this.parsedInput = this.parseQueryString(input);
    }
    if (typeof input === 'object') {
      const parsedInput = options.merge ? this.parseQueryString() : {};
      this.parsedInput = Object.assign(parsedInput, input);
    }
    if (options.hashBase) {
      this.hashBase = options.hashBase;
    }
  }


  parseQueryString(input) {
    // vue router without history mode enabled handles everything as "hash" part of url
    const searchParams = window.location.hash.split('?')[1];
    let qs = (input || searchParams);
    if (!qs) return {};
    // eslint-disable-next-line sonarjs/single-character-alternation
    qs = qs.trim().replace(/^(\?|#|&)/, '');
    if (!qs) return {};
    if (qs.indexOf('?') > -1) {
      const [, query] = qs.split('?');
      qs = query || '';
    }
    const res = qs.split('&').reduce((a, param) => {
      const aCopy = a;
      const parts = param.replace(/\+/g, ' ').split('=');
      const key = decode(parts.shift());
      const val = parts.length > 0 ? decode(parts.join('=')) : null;
      if (isMultiValueKey(key)) {
        const parsedVal = JSON.parse(val);
        if (Array.isArray(parsedVal)) {
          aCopy[key.slice(0, -2)] = parsedVal;
        }
      } else {
        aCopy[key] = val;
      }
      return aCopy;
    }, {});
    return res;
  }

  asString() {
    const queryString = Object.entries(this.parsedInput).map(([key, val]) => {
      if (!val) {
        return encode(key);
      }
      if (Array.isArray(val)) {
        const encodedKey = encode(`${key}[]`);
        return `${encodedKey}=${encode(JSON.stringify(val))}`;
      }
      return `${encode(key)}=${encode(val)}`;
    }).filter((x) => x.length > 0).join('&');
    return queryString ? `?${queryString}` : '';
  }

  asHashString() {
    const hashBase = this.hashBase || window.location.hash.split('?')[0];
    const queryString = this.asString();
    return `${encodeURI(hashBase)}${queryString}`;
  }

  updateQueryUrl() {
    window.location.hash = this.asHashString();
  }

  getParams() {
    return this.parsedInput || {};
  }

  get(key) {
    return this.parsedInput[key];
  }

  set(key, value) {
    this.parsedInput[key] = value;
  }

  delete(key) {
    delete this.parsedInput[key];
  }
}
