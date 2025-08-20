import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from 'react-redux';
export const UserLogin = async ({ email, password }) => {
  const res = await axios.post(BASEAPIURL + "/user/login", {
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
  const res = await axios.post(BASEAPIURL + "/user/register", {
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

// export const getUserData = async () => {
//   try {
//     const res = await axios.get(`${BASEAPIURL}user/${userId}`, {
//       headers: await authHeader(),
//     });
//     return res.data;
//   } catch (error) {
//     return;
//   }
// };


// export const getUserData = async (userId) => {
//   try {
   

//     if (!userId) {
//       throw new Error('User not found');
//     }

//     const res = await axios.get(`${BASEAPIURL}/user/${userId}`, {
//       headers: await authHeader(),
//     });

//     return res.data;
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return null;
//   }
// };



export const getUpdatedTokens = async (refreshToken) => {
  try {
    const res = await axios.post(
      `${BASEAPIURL}/user/refresh`,
      { refreshToken },
      { headers: await authHeader() }
    );

    if (res && res.data && res.data.status === 0) {
      console.log("New Tokens Received:", res.data);

      // ✅ STORE NEW TOKENS IN ASYNCSTORAGE
      await AsyncStorage.setItem("token", res.data.accessToken);
      await AsyncStorage.setItem("refresh_token", res.data.refreshToken);

      return res.data; // Return new tokens
    } else {
      console.error("Invalid response:", res);
      return null;
    }
  } catch (error) {
    console.error("Error in getUpdatedTokens:", error);
    return null;
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
      `${BASEAPIURL}/user/forgot-password/reset`,
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
      `${BASEAPIURL}/user/verify-password`,
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
    const res = await axios.post(
      `${BASEAPIURL}/auth/delete-user`,
      {},
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    return;
  }
};
