import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PremiumBadge = ({ 
  showExpiry = false, 
  remainingDays = null, 
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallBadge,
          text: styles.smallText,
          icon: 10
        };
      case 'large':
        return {
          container: styles.largeBadge,
          text: styles.largeText,
          icon: 16
        };
      default:
        return {
          container: styles.normalBadge,
          text: styles.normalText,
          icon: 12
        };
    }
  };

  const badgeStyle = getBadgeSize();

  return (
    <View style={styles.container}>
      <View style={[styles.premiumBadge, badgeStyle.container]}>
        <Icon name="star" size={badgeStyle.icon} color="#FFD700" />
        <Text style={[styles.premiumText, badgeStyle.text]}>Premium</Text>
      </View>
      {showExpiry && remainingDays && (
        <Text style={styles.expiryText}>
          Expires in {remainingDays} days
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  premiumText: {
    color: '#856404',
    fontWeight: '600',
    marginLeft: 4,
  },
  expiryText: {
    fontSize: 10,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'left',
  },
  // Size variations
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  smallText: {
    fontSize: 10,
  },
  normalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  normalText: {
    fontSize: 12,
  },
  largeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  largeText: {
    fontSize: 14,
  },
});

export default PremiumBadge;
