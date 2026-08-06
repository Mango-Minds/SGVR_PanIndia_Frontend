import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

/**
 * LiveRatesCard Component
 * Displays Buy/Sell prices with Low/High values for gold/silver rates
 */
const LiveRatesCard = ({ label, buy, sell, low, high }) => {
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.labelContainer}>
        <Icon name="trending-up" size={18} color={jewelleryColors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <View style={[styles.priceColumn, styles.buyColumn]}>
          <View style={styles.priceHeader}>
            <Icon name="arrow-downward" size={16} color={jewelleryColors.success} />
            <Text style={styles.priceLabel}>BUY</Text>
          </View>
          <Text style={styles.priceValue}>
            {formatPrice(buy)}
          </Text>
          {low !== null && low !== undefined && (
            <View style={styles.rangeContainer}>
              <Icon name="remove" size={14} color={jewelleryColors.error} />
              <Text style={styles.rangeLabel}>LOW</Text>
              <Text style={styles.rangeValue}>{formatPrice(low)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={[styles.priceColumn, styles.sellColumn]}>
          <View style={styles.priceHeader}>
            <Icon name="arrow-upward" size={16} color={jewelleryColors.error} />
            <Text style={styles.priceLabel}>SELL</Text>
          </View>
          <Text style={styles.priceValue}>
            {formatPrice(sell)}
          </Text>
          {high !== null && high !== undefined && (
            <View style={styles.rangeContainer}>
              <Icon name="add" size={14} color={jewelleryColors.success} />
              <Text style={styles.rangeLabel}>HIGH</Text>
              <Text style={styles.rangeValue}>{formatPrice(high)}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: jewelleryColors.bg,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: jewelleryColors.primary,
    borderStyle: 'solid',
    shadowColor: jewelleryColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
  },
  label: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.text,
    marginLeft: spacing.xs,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  buyColumn: {
    paddingRight: spacing.md,
  },
  sellColumn: {
    paddingLeft: spacing.md,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priceLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: jewelleryColors.textSecondary,
    marginLeft: spacing.xs,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  priceValue: {
    ...typography.heading2,
    fontWeight: '800',
    color: jewelleryColors.primary,
    marginBottom: spacing.md,
    fontSize: 24,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginTop: spacing.xs,
    width: '100%',
    justifyContent: 'center',
  },
  rangeLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: jewelleryColors.textSecondary,
    fontSize: 10,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
    letterSpacing: 0.5,
  },
  rangeValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: jewelleryColors.text,
    fontSize: 12,
  },
  divider: {
    width: 2,
    height: 80,
    backgroundColor: jewelleryColors.primary,
    opacity: 0.3,
    marginHorizontal: spacing.lg,
    borderRadius: 1,
  },
});

export default LiveRatesCard;

