export default (obj, path) => (path.split('.').reduce((value, el) => value?.[el], obj));
