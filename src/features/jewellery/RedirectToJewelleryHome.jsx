import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { jewelleryColors } from '../../styles/jewellery.styles';

/**
 * Replaces legacy jewellery role homes (VendorHome, DesignerHome, etc.)
 * so crash recovery / stale nav never lands on old UI.
 */
const RedirectToJewelleryHome = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.replace('HomeScreen');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={jewelleryColors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});

export default RedirectToJewelleryHome;
