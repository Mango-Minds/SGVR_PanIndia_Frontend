import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const UserLogin = async ({ email, password }) => {
  const res = await axios.post(BASEAPIURL + "/auth/login", {
    email,
    password,
    userType: "U",
  });
  return res.data;
};

export const UserSignup = async ({
  firstName,
  // midname,
  lastName,
  email,
  // phone,
  password,
  // suggestedBy,
  // dob,
  // gender,
  // address,
  // state,
  // pincode,
}) => {
  const res = await axios.post(BASEAPIURL + "/register", {
    firstName,
    // midname,
    lastName,
    email,
    // phone,
    password,
    // suggestedBy,
    // dob,
    // gender,
    // address,
    // state,
    // pincode,
  });
  return res.data;
};

export const getUserData = async () => {
  try {
    const res = await axios.get(`${BASEAPIURL}/auth/logged-in-user`, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    return;
  }
};

export const getUpdatedTokens = async (token) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/auth/refresh-token`,
      {
        token: token,
      },
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    return;
  }
};

export const reportIssue = async (issue) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/report/create-report`,
      {
        reportedOnType: "",
        reportedOnId: "",
        description: issue,
        module: "",
      },
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    return;
  }
};

export const changeForgotPassword = async (data) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/auth/forgot-password-reset`,
      data,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    return;
  }
};

export const verifyPassword = async (password) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/auth/verify-password`,
      {
        cpassword: password,
      },
      {
        headers: await authHeader(),
      }
    );
    return res.data; //true/false
  } catch (error) {
    return;
  }
};

export const deleteAccount = async (id) => {
  try {
    const res = await axios.delete(
      `${BASEAPIURL}/auth/delete-user`,
      {
        cpassword: password,
      },
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    return;
  }
};
