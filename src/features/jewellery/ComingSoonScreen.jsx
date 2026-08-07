import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

/**
 * Placeholder for jewellery dashboard tiles that are not built yet.
 * Prevents crashes from navigating to unregistered route names.
 */
const ComingSoonScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const title = route.params?.titleKey
    ? t(route.params.titleKey)
    : route.params?.title || t('jw_this_section');

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        title={title}
        showNotification={false}
        showShare={false}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.body}>
        <Icon name="clock-outline" size={56} color={jewelleryColors.primary} />
        <Text style={styles.heading}>{t('comingSoon')}</Text>
        <Text style={styles.subtext}>
          {t('jw_coming_soon_body', { title })}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('HomeScreen')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{t('jw_back_to_home')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  heading: {
    ...typography.heading2,
    marginTop: spacing.md,
  },
  subtext: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ComingSoonScreen;
