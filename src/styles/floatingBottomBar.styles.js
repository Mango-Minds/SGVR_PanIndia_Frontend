import { StyleSheet } from "react-native";
import Theme from "./theme";

/** Shared floating bottom nav styles (matches dashboard / social). */
export const floatingBottomBarStyles = StyleSheet.create({
  floatingBar: {
    marginHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  floatingBarIconWrap: {
    position: "relative",
  },
  messageBadge: {
    position: "absolute",
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  messageBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  floatingBarText: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
    color: "#333",
  },
  floatingBarTextActive: {
    color: Theme.themeColor,
    fontWeight: "600",
  },
});

/** Shared filled Ionicons names (same as dashboard bottom bar). */
export const FLOATING_BAR_ICONS = {
  home: "home",
  people: "people",
  person: "person",
  search: "search",
  diamond: "diamond",
  heart: "heart",
  jobs: "briefcase",
  messages: "chatbubble-ellipses",
  alerts: "notifications",
};

export const FLOATING_BAR_ICON_SIZE = 22;
export const FLOATING_BAR_ACTIVE_COLOR = Theme.themeColor;
export const FLOATING_BAR_INACTIVE_COLOR = "#333";
