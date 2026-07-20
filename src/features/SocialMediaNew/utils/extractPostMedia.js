const normalizeUri = (uri) =>
  typeof uri === "string" ? uri.replace(/\\/g, "/") : "";

/**
 * Flattens images and videos from a user's posts into gallery items.
 * @param {Array} posts - Array of post objects from userposts.posts
 * @returns {Array<{ id: string, uri: string, type: 'image'|'video', postId: string }>}
 */
export const extractPostMedia = (posts = []) => {
  if (!Array.isArray(posts)) return [];

  const items = [];

  posts.forEach((post) => {
    if (!post?._id) return;

    const postId = post._id;

    if (post.video) {
      items.push({
        id: `${postId}-video`,
        uri: normalizeUri(post.video),
        type: "video",
        postId,
      });
      return;
    }

    const images = post.images || [];
    images.forEach((image, index) => {
      if (!image) return;
      items.push({
        id: `${postId}-img-${index}`,
        uri: normalizeUri(image),
        type: "image",
        postId,
      });
    });
  });

  return items;
};
