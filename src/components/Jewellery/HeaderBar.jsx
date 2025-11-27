import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const HeaderBar = ({ 
  title, 
  showBack = false, 
  showNotification = true, 
  showShare = false,
  onNotificationPress,
  onSharePress,
  onBackPress,
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
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      <View style={styles.rightSection}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: jewelleryColors.bg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.heading3,
    marginLeft: spacing.sm,
  },
});

export default HeaderBar;

