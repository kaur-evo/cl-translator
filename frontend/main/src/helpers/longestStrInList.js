export default (arr) => arr.reduce((a, b) => (String(a).length < String(b).length ? b : a), '');
