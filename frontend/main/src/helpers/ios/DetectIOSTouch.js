const isIpadOS = () => navigator.maxTouchPoints
  && navigator.maxTouchPoints > 2
  && (/MacIntel/).test(navigator?.userAgentData?.platform ?? navigator.platform);

export const isIOS = () => {
  if ((/iPad|iPhone|iPod/).test(navigator?.userAgentData?.platform ?? navigator.platform)) {
    return true;
  }
  return isIpadOS();
};
export default function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ].includes(window.navigator.platform)
  // iPad on iOS 13 detection
  || (window.navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}
