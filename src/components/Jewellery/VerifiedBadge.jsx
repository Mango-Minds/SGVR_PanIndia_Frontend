import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors } from '../../styles/jewellery.styles';

const VerifiedBadge = ({ size = 'medium' }) => {
  const badgeSize = size === 'small' ? 20 : 24;
  const iconSize = size === 'small' ? 12 : 16;
  const fontSize = size === 'small' ? 8 : 10;

  return (
    <View style={[styles.badge, { height: badgeSize, paddingHorizontal: badgeSize * 0.4 }]}>
      <Icon name="check" size={iconSize} color="#FFFFFF" />
      <Text style={[styles.text, { fontSize }]}>Verified</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: jewelleryColors.primary,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default VerifiedBadge;

