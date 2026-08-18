export default function vIconRaw(val, size, color, classes, margin) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    style="width: ${size}px; height: ${size}px; display: inline-flex; margin:${margin}"
    role="img" 
    aria-hidden="true" 
    class="v-icon__svg ${classes}">
    <g fill="${color}">
      <path d="${val}"></path>
    </g>
    </svg>`;
}
