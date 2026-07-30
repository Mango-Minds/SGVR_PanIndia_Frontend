import Constants from "expo-constants";
import { Platform } from "react-native";

const DEV_PORT = 5050;

/**
 * Dev API host: EXPO_PUBLIC_DEV_API_HOST override, else Android emulator 10.0.2.2,
 * else Expo hostUri (physical device), else 127.0.0.1 (iOS simulator / web).
 */
function resolveDevHost() {
  const fromEnv = process.env.EXPO_PUBLIC_DEV_API_HOST?.trim();
  if (fromEnv) {
    return fromEnv.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  }
  // Emulator/simulator must use loopback aliases, not the LAN IP from Metro.
  if (Platform.OS === "android" && Constants.isDevice === false) {
    return "10.0.2.2";
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }
  return "127.0.0.1";
}

const DEV_HOST = resolveDevHost();

// Development URLs (used when __DEV__ is true)
const DEV_BASEAPIURL = `http://${DEV_HOST}:${DEV_PORT}/api`;
const DEV_BASEIMGURL = `http://${DEV_HOST}:${DEV_PORT}/`;
const DEV_RENDERMEDIAURL = `http://${DEV_HOST}:${DEV_PORT}`;
const DEV_SOCKETURL = `http://${DEV_HOST}:${DEV_PORT}`;

// Production URLs (used when __DEV__ is false)

const PROD_BASEAPIURL = "https://in-bharat.com/api";
const PROD_BASEIMGURL = "https://in-bharat.com/";
const PROD_RENDERMEDIAURL = "https://in-bharat.com";
const PROD_SOCKETURL = "https://in-bharat.com";

// Toggle this to force production URLs even in development mode
// Set to true to test with deployed/production URLs locally
const FORCE_PRODUCTION_MODE = false; // Set true to test against deployed server; false uses local API in dev
// const FORCE_PRODUCTION_MODE = false; 
// Automatically use the right URLs based on __DEV__ flag
// __DEV__ is true in development mode, false in production builds
// FORCE_PRODUCTION_MODE overrides __DEV__ to use production URLs
const isProduction = FORCE_PRODUCTION_MODE || !__DEV__;

export const BASEAPIURL = isProduction ? PROD_BASEAPIURL : DEV_BASEAPIURL;
export const BASEIMGURL = isProduction ? PROD_BASEIMGURL : DEV_BASEIMGURL;
export const RENDERMEDIAURL = isProduction ? PROD_RENDERMEDIAURL : DEV_RENDERMEDIAURL;
export const SOCKETURL = isProduction ? PROD_SOCKETURL : DEV_SOCKETURL;

// Child Safety Standards Configuration
// GitHub Pages URL - when serving from /docs folder, files are served from repository root
// Format: https://[username].github.io/[repository-name]/child-safety-standards.html
export const CHILD_SAFETY_STANDARDS_URL = "https://mango-minds.github.io/SGVR_PanIndia_Frontend/child-safety-standards.html";
export const CHILD_SAFETY_EMAIL = "sgvrtech1@gmail.com";

