import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography } from '../../styles/jewellery.styles';

const RatingDisplay = ({ rating = 0, reviewCount = 0, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="star" size={16} color={jewelleryColors.primary} />
        ))}
        {hasHalfStar && (
          <Icon name="star-half" size={16} color={jewelleryColors.primary} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="star-border" size={16} color={jewelleryColors.primary} />
        ))}
      </View>
      {showCount && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)} ({reviewCount} Reviews)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    ...typography.bodySmall,
    marginLeft: 4,
  },
});

export default RatingDisplay;

