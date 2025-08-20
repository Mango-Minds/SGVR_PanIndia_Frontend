/**
 * Utility functions for generating shareable URLs
 */

const BASE_SHARE_URL = "https://me-maratha.com/share";

/**
 * Generate a unique shareable URL
 * @param {string} type - Type of content (post, event, profile, etc.)
 * @param {string} id - Content ID
 * @param {object} additionalParams - Additional query parameters
 * @returns {string} Shareable URL
 */
export const generateShareUrl = (type, id, additionalParams = {}) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  
  let url = `${BASE_SHARE_URL}/${type}/${id || randomId}?ref=${randomId}&t=${timestamp}`;
  
  // Add additional parameters
  Object.keys(additionalParams).forEach(key => {
    if (additionalParams[key] !== undefined && additionalParams[key] !== null) {
      url += `&${key}=${encodeURIComponent(additionalParams[key])}`;
    }
  });
  
  return url;
};

/**
 * Generate event share URL
 * @param {object} eventData - Event data object
 * @returns {string} Event share URL
 */
export const generateEventShareUrl = (eventData) => {
  const { eventName, eventId, location, organizer } = eventData;
  const slug = eventName?.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  return generateShareUrl('event', eventId || slug, {
    name: eventName,
    location,
    organizer
  });
};

/**
 * Generate post share URL
 * @param {object} postData - Post data object
 * @returns {string} Post share URL
 */
export const generatePostShareUrl = (postData) => {
  const { postId, userId, content } = postData;
  
  return generateShareUrl('post', postId, {
    userId,
    preview: content?.substring(0, 100) // First 100 characters as preview
  });
};

/**
 * Generate profile share URL
 * @param {object} profileData - Profile data object
 * @returns {string} Profile share URL
 */
export const generateProfileShareUrl = (profileData) => {
  const { userId, username, firstName, lastName } = profileData;
  
  return generateShareUrl('profile', userId, {
    username,
    name: `${firstName} ${lastName}`.trim()
  });
};

/**
 * Generate share message with URL
 * @param {string} message - Base message
 * @param {string} url - Share URL
 * @returns {string} Formatted share message
 */
export const generateShareMessage = (message, url) => {
  return `${message}\n\nCheck it out: ${url}`;
};

/**
 * Share content using React Native Share API
 * @param {object} shareData - Share data object
 * @returns {Promise} Share result
 */
export const shareContent = async (shareData) => {
  const { Share } = require('react-native');
  
  try {
    const result = await Share.share(shareData);
    return result;
  } catch (error) {
    console.error('Error sharing content:', error);
    throw error;
  }
};
