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

