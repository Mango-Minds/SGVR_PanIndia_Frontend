// Development URLs (used when __DEV__ is true)
const DEV_BASEAPIURL = "http://192.168.1.7:5050/api";
const DEV_BASEIMGURL = "http://192.168.1.7:5050/";
const DEV_RENDERMEDIAURL = "http://192.168.1.7:5050";
const DEV_SOCKETURL = "http://192.168.1.7:5050";

// Production URLs (used when __DEV__ is false)

const PROD_BASEAPIURL = "https://in-bharat.com/api";
const PROD_BASEIMGURL = "https://in-bharat.com/";
const PROD_RENDERMEDIAURL = "https://in-bharat.com";
const PROD_SOCKETURL = "https://in-bharat.com";

// Toggle this to force production URLs even in development mode
// Set to true to test with deployed/production URLs locally
const FORCE_PRODUCTION_MODE = false; // Change to true to use production URLs

// Automatically use the right URLs based on __DEV__ flag
// __DEV__ is true in development mode, false in production builds
// FORCE_PRODUCTION_MODE overrides __DEV__ to use production URLs
const isProduction = FORCE_PRODUCTION_MODE || !__DEV__;

export const BASEAPIURL = isProduction ? PROD_BASEAPIURL : DEV_BASEAPIURL;
export const BASEIMGURL = isProduction ? PROD_BASEIMGURL : DEV_BASEIMGURL;
export const RENDERMEDIAURL = isProduction ? PROD_RENDERMEDIAURL : DEV_RENDERMEDIAURL;
export const SOCKETURL = isProduction ? PROD_SOCKETURL : DEV_SOCKETURL;

