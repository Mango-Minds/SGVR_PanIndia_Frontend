import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";

/**
 * Unauthenticated client for public browse endpoints (optionalAuth on backend).
 * Avoids sending stale/expired tokens that trigger 401 → session logout cascades.
 */
const publicApiClient = axios.create({
  baseURL: BASEAPIURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApiClient;
