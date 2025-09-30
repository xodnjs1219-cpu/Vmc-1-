export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateInstagramUrl = (url: string): boolean => {
  return /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/.test(url);
};

export const validateYoutubeUrl = (url: string): boolean => {
  return /^https:\/\/(www\.)?youtube\.com\/((@|c\/)[a-zA-Z0-9._-]+)\/?$/.test(
    url,
  );
};

export const validateNaverBlogUrl = (url: string): boolean => {
  return /^https:\/\/(blog|m\.blog)\.naver\.com\/[a-zA-Z0-9_-]+\/?.*$/.test(
    url,
  );
};

export const validateThreadsUrl = (url: string): boolean => {
  return /^https:\/\/(www\.)?threads\.net\/@[a-zA-Z0-9._]+\/?$/.test(url);
};

type Platform = 'instagram' | 'youtube' | 'naver' | 'threads';

export const validateChannelUrl = (
  platform: Platform,
  url: string,
): boolean => {
  switch (platform) {
    case 'instagram':
      return validateInstagramUrl(url);
    case 'youtube':
      return validateYoutubeUrl(url);
    case 'naver':
      return validateNaverBlogUrl(url);
    case 'threads':
      return validateThreadsUrl(url);
    default:
      return false;
  }
};