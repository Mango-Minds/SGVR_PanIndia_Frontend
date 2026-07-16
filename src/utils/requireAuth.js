import { Alert, InteractionManager } from "react-native";
import { exitGuestMode } from "../store/user";

/**
 * Leave guest mode and show the pre-login navigator (Login screen).
 * Deferred until UI interactions (e.g. Alert dismissal) finish to avoid blank screens on iOS.
 */
export function signInFromGuest(dispatch) {
  if (!dispatch) return Promise.resolve();

  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      await dispatch(exitGuestMode());
      resolve();
    });
  });
}

/**
 * Run an action only when the user has a valid auth token.
 * Guests are prompted to sign in; exiting guest mode swaps the root navigator to Login.
 */
export function requireAuth({ token, isGuest, dispatch, navigation, onAuthed, message }) {
  if (token) {
    onAuthed?.();
    return true;
  }

  Alert.alert(
    "Sign in required",
    message || "Please sign in or create an account to use this feature.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign in",
        onPress: () => {
          signInFromGuest(dispatch);
        },
      },
    ]
  );
  return false;
}

export function isAccountModule(path) {
  return ["SocialMedia", "Matrimony", "Community", "Chat", "Settings"].includes(path);
}

const JEWELLERY_AUTH_TAB_CONFIG = {
  profile: {
    screen: "ProfileScreen",
    message: "Sign in to view your jewellery profile.",
  },
  message: {
    screen: "ChatScreen",
    message: "Sign in to view your messages.",
  },
  notifications: {
    screen: "JewelleryNotifications",
    message: "Sign in to view notifications.",
  },
};

/** Default entry screen for the jewellery module (new UI). */
export const JEWELLERY_HOME_SCREEN = "HomeScreen";

/** Enter jewellery module; stack picks OnboardModuleForm or HomeScreen from onboarding state. */
export function navigateToJewellery(navigation) {
  navigation.navigate("Jewellery");
}

/** Bottom-tab destinations in the jewellery module that require a signed-in user. */
export function navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation }) {
  const config = JEWELLERY_AUTH_TAB_CONFIG[tab];
  if (!config) return;

  requireAuth({
    token,
    isGuest,
    dispatch,
    navigation,
    onAuthed: () => navigation.navigate(config.screen),
    message: config.message,
  });
}
