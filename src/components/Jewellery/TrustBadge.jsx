import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography } from '../../styles/jewellery.styles';

const TrustBadge = ({ type }) => {
  const { t } = useTranslation();

  const getIconAndLabel = () => {
    switch (type) {
      case 'certified':
        return { icon: 'verified', label: t('jw_certified') };
      case 'shipping':
        return { icon: 'local-shipping', label: t('jw_free_shipping') };
      case 'return':
        return { icon: 'refresh', label: t('jw_easy_return') };
      default:
        return { icon: 'check-circle', label: t('jw_trusted') };
    }
  };

  const { icon, label } = getIconAndLabel();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: jewelleryColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    textAlign: 'center',
  },
});

export default TrustBadge;
