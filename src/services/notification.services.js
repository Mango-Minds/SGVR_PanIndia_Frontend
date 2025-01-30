import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const readHomeScreenNotification = async () => {
  await axios.patch(
    `${BASEAPIURL}/notifications/notifications`,
    {
      module: "central",
    },
    {
      headers: await authHeader(),
    }
  );
  return;
};

export const readSocialScreenNotification = async () => {
  await axios
    .patch(
      `${BASEAPIURL}/notifications/notifications`,
      {
        module: "meetup",
      },
      {
        headers: await authHeader(),
      }
    )
    .then((data) => {
      console.log(data.data);
    });
  return;
};

export const getNotification = async (module) => {
  // console.log("Printing Module")
  // console.log(module);
  const resp = await axios.get(
    `${BASEAPIURL}/notifications/notifications?module=${module}`,
    {
      headers: await authHeader(),
    }
  );
  return resp.data;
};

export const readNotification = async (module) => {
  await axios.patch(
    `${BASEAPIURL}/notifications/notifications`,
    {
      module: module,
    },
    {
      headers: await authHeader(),
    }
  );
  return;
};
