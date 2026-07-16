import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getWishlist as getWishlistApi,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from '../services/jewellery.services';
import { mapJewelryProduct, resolveImageUrl } from './mapJewelryProduct';

const STORAGE_KEY = 'jewellery_wishlist';

const normalizeProduct = (item) => {
  if (!item) return null;

  // Prefer full API mapping when raw product fields are present
  if (item.name || item.images || item._id) {
    const mapped = mapJewelryProduct(item.product || item);
    if (mapped) {
      return {
        id: mapped.id,
        image: mapped.image,
        title: mapped.title,
        shop: mapped.shop,
        price: mapped.priceLabel || mapped.price,
        rating: mapped.rating,
        reviewCount: mapped.reviewCount,
        category: mapped.productCategory || mapped.category,
      };
    }
  }

  const id =
    item.id ||
    item._id ||
    item.productId ||
    item.product?._id ||
    item.product?.id;

  if (!id) return null;

  const product = item.product || item;
  const shopValue =
    typeof product.shop === 'object' && product.shop
      ? product.shop.name
      : product.shop || product.shopName || item.shop || '';

  return {
    id: String(id),
    image: resolveImageUrl(
      product.image || product.images?.[0] || product.thumbnail || item.image
    ),
    title: product.title || product.name || item.title || 'Jewellery Item',
    shop: typeof shopValue === 'string' ? shopValue : '',
    price: product.priceLabel || product.price || item.price || '',
    rating: product.rating ?? item.rating ?? 0,
    reviewCount: product.reviewCount ?? item.reviewCount ?? 0,
    category: product.productCategory || product.category || item.category || '',
  };
};

export const getLocalWishlist = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProduct).filter(Boolean);
  } catch (error) {
    console.error('Error reading local wishlist:', error);
    return [];
  }
};

const saveLocalWishlist = async (items) => {
  const unique = [];
  const seen = new Set();

  items.forEach((item) => {
    const normalized = normalizeProduct(item);
    if (!normalized || seen.has(normalized.id)) return;
    seen.add(normalized.id);
    unique.push(normalized);
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
};

export const getWishlistItems = async () => {
  const localItems = await getLocalWishlist();

  try {
    const response = await getWishlistApi();
    const apiItems = Array.isArray(response)
      ? response
      : response?.data || response?.wishlist || response?.items || [];

    if (!Array.isArray(apiItems) || apiItems.length === 0) {
      return localItems;
    }

    const mappedApiItems = apiItems.map(normalizeProduct).filter(Boolean);
    if (mappedApiItems.length === 0) {
      return localItems;
    }

    // Prefer server wishlist when available; keep any local-only extras
    const mergedMap = new Map();
    mappedApiItems.forEach((item) => mergedMap.set(item.id, item));
    localItems.forEach((item) => {
      if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
    });

    const merged = Array.from(mergedMap.values());
    await saveLocalWishlist(merged);
    return merged;
  } catch (error) {
    return localItems;
  }
};

export const getWishlistIds = async () => {
  const items = await getWishlistItems();
  return items.map((item) => item.id);
};

export const addWishlistItem = async (product) => {
  const normalized = normalizeProduct(product);
  if (!normalized) return getLocalWishlist();

  const current = await getLocalWishlist();
  if (current.some((item) => item.id === normalized.id)) {
    return current;
  }

  const next = [...current, normalized];
  await saveLocalWishlist(next);

  try {
    await addToWishlistApi(normalized.id);
  } catch (error) {
    // Keep local wishlist even if API is unavailable
  }

  return next;
};

export const removeWishlistItem = async (productId) => {
  const id = String(productId);
  const current = await getLocalWishlist();
  const next = current.filter((item) => item.id !== id);
  await saveLocalWishlist(next);

  try {
    await removeFromWishlistApi(id);
  } catch (error) {
    // Keep local wishlist even if API is unavailable
  }

  return next;
};

export const toggleWishlistItem = async (product) => {
  const normalized = normalizeProduct(product);
  if (!normalized) return { items: await getLocalWishlist(), added: false };

  const current = await getLocalWishlist();
  const exists = current.some((item) => item.id === normalized.id);

  if (exists) {
    const items = await removeWishlistItem(normalized.id);
    return { items, added: false };
  }

  const items = await addWishlistItem(normalized);
  return { items, added: true };
};
