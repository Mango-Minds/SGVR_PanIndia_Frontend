import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  floatingBottomBarStyles as styles,
  FLOATING_BAR_ICONS,
  FLOATING_BAR_ICON_SIZE,
  FLOATING_BAR_ACTIVE_COLOR,
} from "../../styles/floatingBottomBar.styles";

export default function BottomNavigation({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.floatingBar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <TouchableOpacity
        style={styles.floatingBarItem}
        onPress={() => navigation.navigate("MainHome")}
        accessibilityRole="button"
        accessibilityLabel="Home"
      >
        <View style={styles.floatingBarIconWrap}>
          <Ionicons
            name={FLOATING_BAR_ICONS.home}
            size={FLOATING_BAR_ICON_SIZE}
            color={FLOATING_BAR_ACTIVE_COLOR}
          />
        </View>
        <Text style={[styles.floatingBarText, styles.floatingBarTextActive]}>
          Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}
