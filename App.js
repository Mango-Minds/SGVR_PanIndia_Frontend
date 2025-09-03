import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import { Navigation } from "./src/infrastructure/navigation";
import { Provider } from "react-redux";
import store from "./src/store/index";
import { RootSiblingParent } from "react-native-root-siblings";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FollowStatusProvider } from './src/features/SocialMediaNew/FollowStatusContext';
import './src/features/i18n';
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
  
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
   );
}
export default App;
