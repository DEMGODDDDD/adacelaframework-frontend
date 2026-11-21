export const FALLBACK_IMAGE = '/images/goldfish.png';
export const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';
const backendOrigin = new URL(apiBaseUrl, window.location.origin).origin;

export const getMediaUrl = (value) => {
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const path = value.startsWith('/') ? value : `/${value}`;
  return path.startsWith('/storage/') ? new URL(path, backendOrigin).toString() : value;
};

export const getAvatarUrl = (avatar) => {
  if (!avatar) return undefined;
  if (/^(https?:|data:|blob:)/i.test(avatar)) return avatar;
  if (avatar.startsWith('/storage/')) return getMediaUrl(avatar);
  if (avatar.startsWith('/')) return avatar;
  return getMediaUrl(`/storage/${avatar}`);
};
