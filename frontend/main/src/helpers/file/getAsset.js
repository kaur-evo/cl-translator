const images = import.meta.glob('@/assets/images/**', { eager: true });
const icons = import.meta.glob('@/assets/icons/*', { eager: true });

export const getImageAsset = (filename) => {
  const key = `/src/assets/images/${filename}`;
  return images[key]?.default || '';
};

export const getIconAsset = (filename) => {
  const key = `/src/assets/icons/${filename}`;
  return icons[key]?.default || '';
};

export default { getImageAsset, getIconAsset };
