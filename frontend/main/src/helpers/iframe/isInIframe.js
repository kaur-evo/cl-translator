export default function inIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
