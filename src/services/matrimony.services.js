import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getMatrimonyUserExists = async (userId) => {
  const res = await axios.get(
    `${BASEAPIURL}/matrimony/is-exists?userId=${userId}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const editProfileHandler = async (formData) => {
  const res = await axios.patch(`${BASEAPIURL}/matrimony/profile`, formData, {
    headers: await authHeader(),
  });
  return res;
};

export const getMyProfile = async () => {
  const res = await axios.get(`${BASEAPIURL}/matrimony/profile`, {
    headers: await authHeader(),
  });
  return res.data.data;
};

export const fullProfileRequest = async (id) => {
  const res = await axios.patch(
    `${BASEAPIURL}/matrimony/full-profile-request`,
    {
      id: id,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getAllMatrimonyProfiles = async (gender) => {
  const res = await axios.get(
    `${BASEAPIURL}/matrimony/all-profiles?gender=${gender}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getCurrentUserMatrimonyprofile = async () => {
  const res = await axios.get(`${BASEAPIURL}/matrimony/profile`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getMatrimonyOneUser = async (userId) => {
  const res = await axios.get(
    `${BASEAPIURL}/matrimony/one-profile?id=${userId}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data.data;
};

export const deactivateMatrimonyAccount = async (reason) => {
  const res = await axios.patch(
    `${BASEAPIURL}/matrimony/deactivate`,
    {
      reason: reason,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const activateMatrimonyAccount = async () => {
  const res = await axios.get(`${BASEAPIURL}/matrimony/activate`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const createMatrimonyAccount = async (details) => {
  const res = await axios.post(`${BASEAPIURL}/matrimony/profile`, details, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getShceduledDates = async (vendor_id, month, year) => {
  const res = await axios.get(
    `${BASEAPIURL}/Scheduler/scheduler-get-by-vendor-id?vendorId=${vendor_id}&month=${month}&year=${year}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const likeHandler = async (_id) => {
  const res = await axios
    .patch(
      `${BASEAPIURL}/matrimony/like`,
      {
        id: _id,
      },
      {
        headers: await authHeader(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
  // return res.data;
};

export const likeBackHandler = async (_id) => {
  const res = await axios
    .patch(
      `${BASEAPIURL}/matrimony/like-back`,
      {
        id: _id,
      },
      {
        headers: await authHeader(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
  // return res.data;
};

export const deleteLike = async (_id) => {
  const res = await axios
    .patch(
      `${BASEAPIURL}/matrimony/delete-like-request`,
      {
        id: _id,
      },
      {
        headers: await authHeader(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
  // return res.data;
};

export const deactivateAccountHandler = async (id, reason) => {
  const res = await axios.patch(
    `${BASEAPIURL}/matrimony/deactivate`,
    {
      reason: reason,
      id: id,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const activateAccountHandler = async (id) => {
  const res = await axios.patch(
    `${BASEAPIURL}/matrimony/activate`,
    {
      id: id,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getAllRequest = async () => {
  let data = {};
  const res = await axios
    .get(`${BASEAPIURL}/matrimony/full-profile-requests`, {
      headers: await authHeader(),
    })
    .then((res) => {
      data = res.data.data;
    })
    .catch((err) => {
      console.log(err);
    });

  return data;
};

export const fullProfileRequestAccept = async (id) => {
  const res = await axios.patch(
    `${BASEAPIURL}/matrimony/full-profile-request-accept`,
    {
      id: id,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const fullProfileRequestReject = async (id) => {
  const res = await axios.patch(
    `${BASEAPIURL}/matrimony/full-profile-request-reject`,
    {
      id: id,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};
