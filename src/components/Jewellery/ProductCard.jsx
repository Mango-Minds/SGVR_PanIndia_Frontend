import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';
import RatingDisplay from './RatingDisplay';

const ProductCard = ({
  id,
  image,
  title,
  shop,
  price,
  rating = 0,
  reviewCount = 0,
  isWishlisted = false,
  onPress,
  onWishlist,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {!imageError && image ? (
          <Image 
            source={{ uri: image }} 
            style={styles.image} 
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={40} color={jewelleryColors.textSecondary} />
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={onWishlist}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={isWishlisted ? 'favorite' : 'favorite-border'}
            size={20}
            color={isWishlisted ? jewelleryColors.primary : '#999'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.shop} numberOfLines={1}>
          {shop}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>${price}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={jewelleryColors.success} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  shop: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    ...typography.bodySmall,
    color: jewelleryColors.text,
  },
});

export default ProductCard;

