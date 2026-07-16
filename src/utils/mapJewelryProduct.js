import { BASEIMGURL } from '../infrastructure/constants';

export const resolveImageUrl = (image) => {
  if (!image || typeof image !== 'string' || image.trim() === '') return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${BASEIMGURL}${image.startsWith('/') ? image.slice(1) : image}`;
};

export const formatJewelryPrice = (price) => {
  if (price == null || price === '') return '';
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return String(price);
  return `₹${numeric.toLocaleString('en-IN')}`;
};

const formatLabel = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const mapJewelryProduct = (product) => {
  if (!product) return null;

  const id = product._id || product.id;
  if (!id) return null;

  const shop =
    typeof product.shop === 'object' && product.shop
      ? product.shop
      : null;

  const images = Array.isArray(product.images)
    ? product.images.map(resolveImageUrl).filter(Boolean)
    : [];

  const locationParts = [
    shop?.address,
    shop?.city,
    shop?.state,
  ].filter(Boolean);

  return {
    id: String(id),
    _id: String(id),
    title: product.name || product.title || 'Jewellery Item',
    name: product.name || product.title || 'Jewellery Item',
    image: images[0] || resolveImageUrl(product.image) || null,
    images,
    shop: shop?.name || product.shopName || (typeof product.shop === 'string' ? product.shop : '') || '',
    shopId: shop?._id ? String(shop._id) : product.shopId || null,
    price: product.price,
    priceLabel: formatJewelryPrice(product.price),
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    category: product.category || '',
    productCategory: product.productCategory || '',
    description: product.description || '',
    condition: product.condition || '',
    quantity: product.quantity ?? 1,
    quality: product.quality || '',
    weightPerProduct: product.weightPerProduct ?? 0,
    goldAvailable: product.goldAvailable || '',
    contact: {
      location: locationParts.join(', ') || 'Location not available',
      phone: shop?.phone || product.phone || shop?.owner?.phone || '',
      hours: shop?.hours || shop?.timing || product.hours || '',
    },
    specifications: {
      metal: formatLabel(product.category) || 'N/A',
      stones: product.quality || 'N/A',
      making: formatLabel(product.condition) || 'N/A',
      dimensions:
        product.weightPerProduct > 0
          ? `${product.weightPerProduct}g`
          : product.goldAvailable || 'N/A',
    },
    isVerified: Boolean(shop?.status === 'accepted' || product.isVerified),
    createdById:
      typeof product.createdBy === 'object' && product.createdBy
        ? String(product.createdBy._id || product.createdBy.id || '')
        : product.createdBy
          ? String(product.createdBy)
          : null,
    phone: product.phone || '',
    hours: product.hours || '',
    raw: product,
  };
};

/** Map product requirement docs to the same UI shape as jewelry products. */
export const mapProductRequirement = (requirement) => {
  if (!requirement) return null;

  const mapped = mapJewelryProduct(requirement);
  if (!mapped) return null;

  const creator =
    typeof requirement.createdBy === 'object' && requirement.createdBy
      ? requirement.createdBy
      : null;
  const creatorName = creator
    ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || 'User'
    : '';

  const locationParts = [
    requirement.location,
    mapped.contact?.location !== 'Location not available'
      ? mapped.contact?.location
      : null,
    creator?.city,
    creator?.state,
  ].filter(Boolean);

  const uniqueLocation = [...new Set(locationParts)].join(', ');

  return {
    ...mapped,
    shop: mapped.shop || creatorName || 'Product Requirement',
    contact: {
      location: uniqueLocation || 'Location not available',
      phone: requirement.phone || creator?.phone || mapped.contact?.phone || '',
      hours: requirement.hours || mapped.contact?.hours || '',
    },
    isRequirement: true,
  };
};
