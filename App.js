import { useCallback, useState } from "react";
import { View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  SimpleLineIcons,
} from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";

import { Navigation } from "./src/infrastructure/navigation";
import { Provider } from "react-redux";
import store from "./src/store/index";
import { RootSiblingParent } from "react-native-root-siblings";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FollowStatusProvider } from "./src/features/SocialMediaNew/FollowStatusContext";
import IntroAnimation from "./src/components/IntroAnimation";
import "./src/features/i18n";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      gcTime: 0, // Updated from cacheTime for @tanstack/react-query v5
      retry: false,
    },
  },
});

function App() {
  const [fontsLoaded] = useFonts({
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...AntDesign.font,
    ...SimpleLineIcons.font,
  });
  const [showIntro, setShowIntro] = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <RootSiblingParent>
              <FollowStatusProvider>
                <Navigation />
              </FollowStatusProvider>
              <ExpoStatusBar style="dark" />
            </RootSiblingParent>
          </Provider>
        </QueryClientProvider>
        {showIntro ? (
          <IntroAnimation onFinish={() => setShowIntro(false)} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}
export default App;
