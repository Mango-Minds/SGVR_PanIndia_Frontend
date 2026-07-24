import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography, spacing } from '../../styles/jewellery.styles';

const hexToRgba = (hex, alpha = 0.12) => {
  if (!hex || typeof hex !== 'string') return `rgba(212, 175, 55, ${alpha})`;
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(212, 175, 55, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CategoryIcon = ({
  name,
  icon,
  color,
  onPress,
  size = 70,
}) => {
  const iconSize = Math.round(size * 0.42);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.iconShell,
          {
            width: size,
            height: size,
            backgroundColor: hexToRgba(color, 0.14),
            borderColor: hexToRgba(color, 0.35),
            shadowColor: color,
          },
        ]}
      >
        <View
          style={[
            styles.iconInner,
            {
              width: size * 0.72,
              height: size * 0.72,
              backgroundColor: hexToRgba(color, 0.22),
            },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
        </View>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  iconShell: {
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  iconInner: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
    minHeight: 32,
    lineHeight: 16,
    color: '#374151',
  },
});

export default CategoryIcon;
