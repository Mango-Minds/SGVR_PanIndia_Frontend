import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const TabSegment = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: jewelleryColors.bgSecondary,
    marginRight: spacing.sm,
  },
  activeTab: {
    backgroundColor: jewelleryColors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: jewelleryColors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TabSegment;


