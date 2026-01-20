import apiClient from "../store/apiClient";
import { BASEAPIURL } from "../infrastructure/constants";

export const getShopData = async () => {
  const res = await apiClient.get(
    `/vendor/vendor-for-user?module=store&role=shop`
  );
  return res.data;
};

export const getEachShopData = async (id) => {
  const res = await apiClient.get(`/vendor/vendor-for-user?id=${id}`);
  return res.data;
};

export const getRetailersData = async () => {
  const res = await apiClient.get(
    `/vendor/vendor-for-user?module=store&role=vendor`
  );
  return res.data;
};

export const getWorkersData = async () => {
  const res = await apiClient.get(`/worker/worker`);
  return res.data;
};

export const getWorkersSearchData = async (keyword) => {
  const res = await apiClient.get(
    `/worker/worker?keyword=${keyword}`
  );
  return res.data;
};

export const getShopRetailerSearchData = async (props) => {
  const role = props.index === 1 ? "vendor" : "shop";
  const res = await apiClient.get(
    `/vendor/vendor?keyword=${props.search}&role=${role}`
  );
  return res.data;
};

export const getJewelleryData = async (id) => {
  // const res = await axios.get(`${BASEAPIURL}/jewellery/${id}`, {
  //    headers: await authHeader(),
  // });
  const dummyJewelleryData = {
    productName: "Diamond Necklace",
    productQuantity: "1",
    productDescription: "Beautiful diamond necklace with platinum setting.",
    productQuality: "High",
    pieces: "1",
    productweight: "10 grams",
    images: [{
      assetId: null,
base64: null,
duration: null,
exif: null,
fileName: null,
filesize: null,
height: 360,
mimeType: "image/jpeg",
rotation: null,
type: "image",
uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FDaivajnyaBrahmin-164234a6-5681-4c2c-b3d0-69109a150d63/ImagePicker/6e6c86f0-d98f-43db-ad09-552033f1a310.jpeg",
width: 480,
    }
    
    ]
  };
  // return res.data;
  return dummyJewelleryData;
 };
 
export const editJewelleryData = async (id, formData) => {
  const res = await apiClient.patch(`/jewellery/${id}`, formData);
  return res.data;
 };

// New API methods for modern jewellery module

// Shops
export const getShops = async (params = {}) => {
  const { page = 1, limit = 20, location, brand, rating } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(location && { location }),
    ...(brand && { brand }),
    ...(rating && { rating }),
  });
  
  try {
    const res = await apiClient.get(
      `/vendor/vendor-for-user?module=store&role=shop&${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shops:', error);
    throw error;
  }
};

export const getShopDetails = async (id) => {
  try {
    const res = await apiClient.get(`/vendor/vendor-for-user?id=${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching shop details:', error);
    throw error;
  }
};

export const getShopByOwner = async (ownerId) => {
  try {
    const res = await apiClient.get(
      `/vendor/vendor-for-user?module=store&role=shop`
    );
    // Find shop where owner matches the ownerId
    const shops = res.data?.data || [];
    const shop = shops.find(s => 
      s.owner?._id === ownerId || 
      s.owner?._id?.toString() === ownerId?.toString() ||
      s.owner?.toString() === ownerId?.toString()
    );
    return shop || null;
  } catch (error) {
    console.error('Error fetching shop by owner:', error);
    throw error;
  }
};

export const searchShops = async (params) => {
  const { keyword, location, brand, rating } = params;
  const queryParams = new URLSearchParams({
    ...(keyword && { keyword }),
    ...(location && { location }),
    ...(brand && { brand }),
    ...(rating && { rating }),
  });
  
  try {
    const res = await apiClient.get(
      `/vendor/vendor?role=shop&${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error searching shops:', error);
    throw error;
  }
};

// Products
export const getProducts = async (params = {}) => {
  const { page = 1, limit = 20, category, search } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
    ...(search && { search }),
  });
  
  try {
    // Using jewellery-products endpoint if available, otherwise fallback
    const res = await apiClient.get(
      `/jewelry-products?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array if endpoint doesn't exist yet
    return { data: [], pagination: { page, limit, total: 0 } };
  }
};

export const getProductDetails = async (id) => {
  try {
    const res = await apiClient.get(`/jewelry-products/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// CRUD operations for jewelry products (shop owners)
export const createJewelryProduct = async (productData) => {
  try {
    const res = await apiClient.post(
      `/jewelry-products`,
      productData
    );
    return res.data;
  } catch (error) {
    console.error('Error creating jewelry product:', error);
    throw error;
  }
};

export const updateJewelryProduct = async (id, productData) => {
  try {
    const res = await apiClient.patch(
      `/jewelry-products/${id}`,
      productData
    );
    return res.data;
  } catch (error) {
    console.error('Error updating jewelry product:', error);
    throw error;
  }
};

export const deleteJewelryProduct = async (id) => {
  try {
    const res = await apiClient.delete(`/jewelry-products/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting jewelry product:', error);
    throw error;
  }
};

export const getShopProducts = async (shopId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      shop: shopId,
      ...params,
    });
    const res = await apiClient.get(
      `/jewelry-products?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shop products:', error);
    throw error;
  }
};

export const searchProducts = async (params) => {
  const { keyword, category } = params;
  const queryParams = new URLSearchParams({
    ...(keyword && { keyword }),
    ...(category && { category }),
  });
  
  try {
    const res = await apiClient.get(
      `/jewelry-products?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Wishlist
export const getWishlist = async () => {
  try {
    const res = await apiClient.get(`/wishlists`);
    return res.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { data: [] };
  }
};

export const addToWishlist = async (productId) => {
  try {
    const res = await apiClient.post(
      `/wishlists/${productId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const res = await apiClient.delete(`/wishlists/${productId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Subscriptions
export const getSubscriptionPlans = async () => {
  try {
    const res = await apiClient.get(`/subscriptions/plans`);
    return res.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    // Return default plans if endpoint doesn't exist
    return {
      data: [
        {
          id: 'monthly',
          name: 'Monthly',
          price: 99,
          period: 'month',
          features: [
            'Access to 100+ Verified Shops',
            'Shop Contact Details',
            'Shop Ratings & Reviews',
            'Basic Support',
          ],
        },
        {
          id: 'quarterly',
          name: 'Quarterly',
          price: 299,
          period: 'quarter',
          features: [
            'Access to 100+ Verified Shops',
            'Shop Contact Details',
            'Shop Ratings & Reviews',
            'Priority Support',
            'Exclusive Deals',
          ],
        },
        {
          id: 'yearly',
          name: 'Yearly',
          price: 1999,
          period: 'year',
          features: [
            'Access to 100+ Verified Shops',
            'Shop Contact Details',
            'Shop Ratings & Reviews',
            'Priority Support',
            'Exclusive Deals',
            'Early Access to New Shops',
            'Premium Customer Service',
          ],
        },
      ],
    };
  }
};

export const subscribeToPlan = async (planType) => {
  try {
    const res = await apiClient.post(
      `/subscriptions/subscribe`,
      { planType }
    );
    return res.data;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    throw error;
  }
};

export const getCurrentSubscription = async () => {
  try {
    const res = await apiClient.get(`/subscriptions/current`);
    return res.data;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return null;
  }
};

// QR Code
export const getQRCode = async (shopId) => {
  try {
    const res = await apiClient.get(`/shops/${shopId}/qr-code`);
    return res.data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a placeholder QR value if endpoint doesn't exist
    return { qrValue: `shop-${shopId}`, qrImage: null };
  }
};

// Stock Items - Separate APIs for inventory management
export const getStockItems = async (params = {}) => {
  const { page = 1, limit = 20, shop, category, productCategory, search } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(shop && { shop }),
    ...(category && { category }),
    ...(productCategory && { productCategory }),
    ...(search && { search }),
  });
  
  try {
    const res = await apiClient.get(
      `/jewelry-stock-items?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching stock items:', error);
    throw error;
  }
};

export const getStockItemDetails = async (id) => {
  try {
    const res = await apiClient.get(`/jewelry-stock-items/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching stock item details:', error);
    throw error;
  }
};

export const createStockItem = async (stockItemData) => {
  try {
    // apiClient will handle headers automatically, including FormData
    const res = await apiClient.post(
      `/jewelry-stock-items`,
      stockItemData
    );
    return res.data;
  } catch (error) {
    console.error('Error creating stock item:', error);
    throw error;
  }
};

export const updateStockItem = async (id, stockItemData) => {
  try {
    // apiClient will handle headers automatically, including FormData
    const res = await apiClient.patch(
      `/jewelry-stock-items/${id}`,
      stockItemData
    );
    return res.data;
  } catch (error) {
    console.error('Error updating stock item:', error);
    throw error;
  }
};

export const deleteStockItem = async (id) => {
  try {
    const res = await apiClient.delete(`/jewelry-stock-items/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting stock item:', error);
    throw error;
  }
};

export const getShopStockItems = async (shopId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      shop: shopId,
      ...params,
    });
    const res = await apiClient.get(
      `/jewelry-stock-items?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shop stock items:', error);
    throw error;
  }
};

// Follow functionality for jewelry module
export const followUser = async (userId) => {
  try {
    const res = await apiClient.post(
      `/social/follow/${userId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const res = await apiClient.patch(
      `/social/unfollow/${userId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const checkFollowStatus = async (userId) => {
  try {
    const res = await apiClient.get(
      `/social/check-follow-status/${userId}`
    );
    return res.data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    // Return default status if error occurs
    return { status: 'none', friendStatus: 'none' };
  }
};

export const getFollowers = async (userId, params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const res = await apiClient.get(
      `/social/${userId}/followers?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

export const getFollowing = async (userId, params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const res = await apiClient.get(
      `/social/${userId}/following?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};

// Reviews
export const createShopReview = async (shopId, rating, comment = '') => {
  try {
    const res = await apiClient.post(
      `/reviews/shop/${shopId}`,
      { rating, comment }
    );
    return res.data;
  } catch (error) {
    console.error('Error creating shop review:', error);
    throw error;
  }
};

export const getShopReviews = async (shopId, params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const res = await apiClient.get(
      `/reviews/shop/${shopId}?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    throw error;
  }
};

// Shop Events
export const createShopEvent = async (eventData) => {
  try {
    const res = await apiClient.post('/shopEvents', eventData);
    return res.data;
  } catch (error) {
    console.error('Error creating shop event:', error);
    throw error;
  }
};

export const getShopEvents = async (shopId, eventDate = null) => {
  try {
    let url = `/shopEvents/shop/${shopId}`;
    if (eventDate) {
      url += `?eventDate=${eventDate}`;
    }
    const res = await apiClient.get(url);
    return res.data;
  } catch (error) {
    console.error('Error fetching shop events:', error);
    throw error;
  }
};

export const getShopEventDatesByMonth = async (shopId, month, year) => {
  try {
    const res = await apiClient.get(
      `/shopEvents/eventsByMonth?shopId=${shopId}&month=${month}&year=${year}`
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shop event dates:', error);
    throw error;
  }
};

export const getShopEvent = async (eventId) => {
  try {
    const res = await apiClient.get(`/shopEvents/${eventId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching shop event:', error);
    throw error;
  }
};

export const updateShopEvent = async (eventId, eventData) => {
  try {
    const res = await apiClient.put(`/shopEvents/${eventId}`, eventData);
    return res.data;
  } catch (error) {
    console.error('Error updating shop event:', error);
    throw error;
  }
};

export const deleteShopEvent = async (eventId) => {
  try {
    const res = await apiClient.delete(`/shopEvents/${eventId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting shop event:', error);
    throw error;
  }
};

