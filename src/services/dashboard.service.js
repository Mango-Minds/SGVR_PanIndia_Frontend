import { useDispatch } from "react-redux";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

const getAdsForUser = async () => {
  try {
    const res = await axios.get(BASEAPIURL + "/ad/ads-for-user", {
      headers: await authHeader(),
    });
    return res.data;
  } catch (err) {
    dispatch(
      ErrorToggle({
        type: "error",
        msg: err.response.data.message,
        toggle: true,
      })
    );
  }
};

const topOnboardedCommunities = async () => {
  const res = await axios.get(
    BASEAPIURL + "/community/community?page=1&limit=10",
    {
      headers: await authHeader(),
    }
  );
};

const topOnboardedVendors = async () => {
  const res = axios.get(
    BASEAPIURL + "/vendor/vendor-for-user?page=1&limit=10",
    {
      headers: await authHeader(),
    }
  );

  return res.data;
};

const getUpcomingEvents = async () => {
  const res = await axios.get(
    BASEAPIURL + "/events/upcoming-events?page=1&limit=20",
    {
      headers: await authHeader(),
    }
  );

  return res.data;
};

export default {
  getAdsForUser,
  topOnboardedCommunities,
  topOnboardedVendors,
  getUpcomingEvents,
};
