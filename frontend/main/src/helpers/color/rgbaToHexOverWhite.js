export default function rgbaToHexOverWhite(color) {
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  if (hexRegex.test(color)) {
    return color.toLowerCase(); // Already in hex format
  }

  const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!parts) {
    throw new Error('Invalid RGBA format.');
  }

  const r = parseInt(parts[1], 10);
  const g = parseInt(parts[2], 10);
  const b = parseInt(parts[3], 10);
  const alpha = parseFloat(parts[4]);

  const bg = 255;

  const finalR = Math.round((r * alpha) + (bg * (1 - alpha)));
  const finalG = Math.round((g * alpha) + (bg * (1 - alpha)));
  const finalB = Math.round((b * alpha) + (bg * (1 - alpha)));

  const toHex = (c) => {
    const HEX_BASE = 16;
    const hex = c.toString(HEX_BASE);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const hexR = toHex(finalR);
  const hexG = toHex(finalG);
  const hexB = toHex(finalB);

  return `#${hexR}${hexG}${hexB}`;
}
