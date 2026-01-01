import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const CategoryIcon = ({ 
  name, 
  icon, 
  color, 
  onPress,
  size = 70 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { width: size, height: size }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon name={icon} size={size * 0.4} color="#FFFFFF" />
      </View>
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
});

export default CategoryIcon;


