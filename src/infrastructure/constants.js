// Development URLs (used when __DEV__ is true)
const DEV_BASEAPIURL = "http://192.168.1.5:5050/api";
const DEV_BASEIMGURL = "http://192.168.1.5:5050/";
const DEV_RENDERMEDIAURL = "http://192.168.1.5:5050";
const DEV_SOCKETURL = "http://192.168.1.5:5050";

// Production URLs (used when __DEV__ is false)
const PROD_BASEAPIURL = "https://api.mimaratha.co.in/api";
const PROD_BASEIMGURL = "https://api.mimaratha.co.in/";
const PROD_RENDERMEDIAURL = "https://api.mimaratha.co.in";
const PROD_SOCKETURL = "https://api.mimaratha.co.in";

// Automatically use the right URLs based on __DEV__ flag
// __DEV__ is true in development mode, false in production builds
export const BASEAPIURL = __DEV__ ? DEV_BASEAPIURL : PROD_BASEAPIURL;
export const BASEIMGURL = __DEV__ ? DEV_BASEIMGURL : PROD_BASEIMGURL;
export const RENDERMEDIAURL = __DEV__ ? DEV_RENDERMEDIAURL : PROD_RENDERMEDIAURL;
export const SOCKETURL = __DEV__ ? DEV_SOCKETURL : PROD_SOCKETURL;

