import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getShopData = async () => {
  const res = await axios.get(
    `${BASEAPIURL}/vendor/vendor-for-user?module=store&role=shop`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getEachShopData = async (id) => {
  const res = await axios.get(`${BASEAPIURL}/vendor/vendor-for-user?id=${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getRetailersData = async () => {
  const res = await axios.get(
    `${BASEAPIURL}/vendor/vendor-for-user?module=store&role=vendor`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getWorkersData = async () => {
  const res = await axios.get(`${BASEAPIURL}/worker/worker`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getWorkersSearchData = async (keyword) => {
  const res = await axios.get(
    `${BASEAPIURL}/worker/worker?keyword=${keyword}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getShopRetailerSearchData = async (props) => {
  const role = props.index === 1 ? "vendor" : "shop";
  const res = await axios.get(
    `${BASEAPIURL}/vendor/vendor?keyword=${props.search}&role=${role}`,
    {
      headers: await authHeader(),
    }
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
  const res = await axios.patch(`${BASEAPIURL}/jewellery/${id}`, formData, {
     headers: await authHeader(),
  });
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
    const res = await axios.get(
      `${BASEAPIURL}/vendor/vendor-for-user?module=store&role=shop&${queryParams}`,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shops:', error);
    throw error;
  }
};

export const getShopDetails = async (id) => {
  try {
    const res = await axios.get(`${BASEAPIURL}/vendor/vendor-for-user?id=${id}`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching shop details:', error);
    throw error;
  }
};

export const getShopByOwner = async (ownerId) => {
  try {
    const res = await axios.get(
      `${BASEAPIURL}/vendor/vendor-for-user?module=store&role=shop`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(
      `${BASEAPIURL}/vendor/vendor?role=shop&${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(
      `${BASEAPIURL}/jewelry-products?${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(`${BASEAPIURL}/jewelry-products/${id}`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// CRUD operations for jewelry products (shop owners)
export const createJewelryProduct = async (productData) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/jewelry-products`,
      productData,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error creating jewelry product:', error);
    throw error;
  }
};

export const updateJewelryProduct = async (id, productData) => {
  try {
    const res = await axios.patch(
      `${BASEAPIURL}/jewelry-products/${id}`,
      productData,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error updating jewelry product:', error);
    throw error;
  }
};

export const deleteJewelryProduct = async (id) => {
  try {
    const res = await axios.delete(`${BASEAPIURL}/jewelry-products/${id}`, {
      headers: await authHeader(),
    });
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
    const res = await axios.get(
      `${BASEAPIURL}/jewelry-products?${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(
      `${BASEAPIURL}/jewelry-products?${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(`${BASEAPIURL}/wishlists`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { data: [] };
  }
};

export const addToWishlist = async (productId) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/wishlists/${productId}`,
      {},
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const res = await axios.delete(`${BASEAPIURL}/wishlists/${productId}`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Subscriptions
export const getSubscriptionPlans = async () => {
  try {
    const res = await axios.get(`${BASEAPIURL}/subscriptions/plans`, {
      headers: await authHeader(),
    });
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
    const res = await axios.post(
      `${BASEAPIURL}/subscriptions/subscribe`,
      { planType },
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    throw error;
  }
};

export const getCurrentSubscription = async () => {
  try {
    const res = await axios.get(`${BASEAPIURL}/subscriptions/current`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return null;
  }
};

// QR Code
export const getQRCode = async (shopId) => {
  try {
    const res = await axios.get(`${BASEAPIURL}/shops/${shopId}/qr-code`, {
      headers: await authHeader(),
    });
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
    const res = await axios.get(
      `${BASEAPIURL}/jewelry-stock-items?${queryParams}`,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching stock items:', error);
    throw error;
  }
};

export const getStockItemDetails = async (id) => {
  try {
    const res = await axios.get(`${BASEAPIURL}/jewelry-stock-items/${id}`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching stock item details:', error);
    throw error;
  }
};

export const createStockItem = async (stockItemData) => {
  try {
    const headers = await authHeader();
    // Remove Content-Type for FormData - axios will set it automatically with boundary
    delete headers['Content-Type'];
    
    const res = await axios.post(
      `${BASEAPIURL}/jewelry-stock-items`,
      stockItemData,
      {
        headers: headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error creating stock item:', error);
    throw error;
  }
};

export const updateStockItem = async (id, stockItemData) => {
  try {
    const headers = await authHeader();
    // Remove Content-Type for FormData - axios will set it automatically with boundary
    delete headers['Content-Type'];
    
    const res = await axios.patch(
      `${BASEAPIURL}/jewelry-stock-items/${id}`,
      stockItemData,
      {
        headers: headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error updating stock item:', error);
    throw error;
  }
};

export const deleteStockItem = async (id) => {
  try {
    const res = await axios.delete(`${BASEAPIURL}/jewelry-stock-items/${id}`, {
      headers: await authHeader(),
    });
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
    const res = await axios.get(
      `${BASEAPIURL}/jewelry-stock-items?${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.post(
      `${BASEAPIURL}/social/follow/${userId}`,
      {},
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const res = await axios.patch(
      `${BASEAPIURL}/social/unfollow/${userId}`,
      {},
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const checkFollowStatus = async (userId) => {
  try {
    const res = await axios.get(
      `${BASEAPIURL}/social/check-follow-status/${userId}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(
      `${BASEAPIURL}/social/${userId}/followers?${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(
      `${BASEAPIURL}/social/${userId}/following?${queryParams}`,
      {
        headers: await authHeader(),
      }
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
    const res = await axios.post(
      `${BASEAPIURL}/reviews/shop/${shopId}`,
      { rating, comment },
      {
        headers: await authHeader(),
      }
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
    const res = await axios.get(
      `${BASEAPIURL}/reviews/shop/${shopId}?${queryParams}`,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    throw error;
  }
};

