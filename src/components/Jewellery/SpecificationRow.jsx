import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const SpecificationRow = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginRight: spacing.md,
    minWidth: 80,
    color: jewelleryColors.text,
  },
  value: {
    ...typography.bodySmall,
    flex: 1,
    color: jewelleryColors.text,
  },
});

export default SpecificationRow;

