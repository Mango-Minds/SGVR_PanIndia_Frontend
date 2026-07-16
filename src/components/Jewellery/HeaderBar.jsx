import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const HeaderBar = ({ 
  title, 
  showBack = false, 
  showNotification = false, 
  showShare = false,
  onNotificationPress,
  onSharePress,
  onBackPress,
  rightActions = null,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      // Navigate to HomeScreen by default
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
            <Icon name="arrow-back" size={24} color={jewelleryColors.text} />
          </TouchableOpacity>
        )}
      </View>

      {title ? (
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : null}

      <View style={styles.rightSection}>
        {rightActions}
        {showNotification && (
          <TouchableOpacity 
            onPress={onNotificationPress || (() => navigation.navigate('JewelleryNotifications'))}
            style={styles.iconButton}
          >
            <Icon name="notifications-none" size={24} color={jewelleryColors.text} />
          </TouchableOpacity>
        )}
        {showShare && (
          <TouchableOpacity onPress={onSharePress} style={styles.iconButton}>
            <Icon name="share" size={24} color={jewelleryColors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: jewelleryColors.bg,
    position: 'relative',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    zIndex: 1,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 72,
  },
  iconButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.heading3,
    textAlign: 'center',
  },
});

export default HeaderBar;

