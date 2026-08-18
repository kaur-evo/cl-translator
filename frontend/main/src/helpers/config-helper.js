export default function processConfig(conf) {
  const parseConfigValue = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  return Object.entries(conf).reduce((confMap, [key, value]) => {
    const feature = (key.split('.'))[1];
    if (feature) {
      return { ...confMap, [feature]: parseConfigValue(value) };
    }
    return confMap;
  }, {});
}
