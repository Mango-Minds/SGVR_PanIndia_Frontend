import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";
import { Navigation } from "./src/infrastructure/navigation";
import { Provider } from "react-redux";
import store from "./src/store/index";
import { RootSiblingParent } from "react-native-root-siblings";
import { QueryClientProvider, QueryClient } from "react-query";
import { SafeAreaProvider } from 'react-native-safe-area-context';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // disabling caching and background reloading during testing
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      cacheTime: 0,
      retry: false,
    },
  },
});

function App() {
  // const [screenVisible, setscreenVisible] = React.useState(true);
  return (
    <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RootSiblingParent>
          {/* {screenVisible ? ( */}
            <Navigation />
          {/* ) : (
            <View
              style={{
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
<View
                style={{
                  flexDirection: "column",
                }}
              >
                <Image
                  source={noInternet}
                  style={{
                    width: 170,
                    height: 170,

                    // backgroundColor:"red",
                    marginLeft: "5%",
                  }}
                  // resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "900",
                    color: "#D8AE25",
                  }}
                >
                  No internet Connection
                </Text>
              </View>

            </View>
          )} */}
          <ExpoStatusBar style="dark" />
        </RootSiblingParent>
      </Provider>
    </QueryClientProvider>
    </SafeAreaProvider>
   );
}
export default App;
