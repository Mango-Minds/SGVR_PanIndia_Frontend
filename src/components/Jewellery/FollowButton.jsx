import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const FollowButton = ({ 
  followStatus, 
  onPress, 
  isLoading = false,
  disabled = false 
}) => {
  const { t } = useTranslation();

  // Determine button state based on followStatus
  const getButtonState = () => {
    if (isLoading) return 'loading';
    if (followStatus === 'approved' || followStatus === 'following') return 'following';
    if (followStatus === 'pending' || followStatus === 'requested') return 'pending';
    return 'none';
  };

  const buttonState = getButtonState();

  const getButtonConfig = () => {
    switch (buttonState) {
      case 'following':
        return {
          backgroundColor: jewelleryColors.success,
          text: t('Following'),
          icon: 'check',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'pending':
        return {
          backgroundColor: jewelleryColors.categoryOrange,
          text: t('jw_pending'),
          icon: 'schedule',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'loading':
        return {
          backgroundColor: jewelleryColors.primary,
          text: t('loading'),
          icon: null,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: jewelleryColors.primary,
          text: t('jw_follow'),
          icon: 'add',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.backgroundColor },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={config.textColor} />
      ) : (
        <>
          {config.icon && (
            <Icon 
              name={config.icon} 
              size={18} 
              color={config.iconColor} 
              style={styles.icon}
            />
          )}
          <Text style={[styles.buttonText, { color: config.textColor }]}>
            {config.text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 100,
    gap: spacing.xs,
  },
  buttonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default FollowButton;
