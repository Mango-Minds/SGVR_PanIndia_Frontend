import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';
import VerifiedBadge from './VerifiedBadge';

const ShopCard = ({
  id,
  image,
  name,
  owner,
  rating = 0,
  reviewCount = 0,
  address,
  hours,
  isVerified = true,
  onPress,
}) => {
  const [imageError, setImageError] = useState(false);
  
  const cardStyle = [
    styles.card,
    Platform.OS === 'android' && {
      marginBottom: spacing.md,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 0,
    },
  ];

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
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
            <Icon name="store" size={40} color={jewelleryColors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isVerified && (
            <View style={styles.badgeContainer}>
              <VerifiedBadge size="small" />
            </View>
          )}
        </View>

        <Text style={styles.owner} numberOfLines={1}>
          {owner}
        </Text>

        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={jewelleryColors.primary} />
          <Text style={styles.rating}>
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewText}> ({reviewCount} Reviews)</Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-on" size={14} color={jewelleryColors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {address}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="access-time" size={14} color={jewelleryColors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.infoText} numberOfLines={1}>{hours}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: jewelleryColors.border,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    margin: spacing.sm,
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
  content: {
    flex: 1,
    padding: spacing.sm,
    paddingLeft: spacing.xs,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: spacing.xs,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
    color: jewelleryColors.text,
  },
  badgeContainer: {
    marginLeft: spacing.xs,
  },
  owner: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    ...typography.bodySmall,
    fontSize: 13,
    marginLeft: 4,
  },
  ratingValue: {
    fontWeight: '700',
    color: jewelleryColors.text,
  },
  reviewText: {
    fontWeight: '400',
    color: jewelleryColors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    flex: 1,
    color: jewelleryColors.textSecondary,
  },
});

export default ShopCard;

