import axios from "axios";
// import { BASEAPIURL } from "../infrastructure/constants";
import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUpdatedTokens, getUserData } from "../services/auth.service";
import authHeader from "../services/auth.header";
import { BASEAPIURL } from "../infrastructure/constants";
import { useSelector } from "react-redux";



const slice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: null,
    refresh_token: null,
    loading: true,
    loadingInBtn: false,
    likedBy: [],
    matrimonyprofileImages: {
      male: [],
      female: [],
    },
    myMatrimonyProfile: {},
    error: {
      toggle: false,
      msg: "Unable To Load",
      type: "error",
    },
    localChats: [],
    conversations: [],
    cloudChats: [],
    socket: "",
    socialData: {
      friendsCount: 0,
      requestCount: 0,
      friendRequest: [],
      friends: [],
      searchList: [],
      postList: [],
      mypostlist: [],
      mybio: {},
    },
    notification: {
      homescreen: [],
      meetup: [],
      matrimony: [],
    },
    temple: {
      templelist: [],
      keyword: "",
    },
  },
  reducers: {
    loadmatrimonyprofileImages: (state, action) => {
      if (action.payload[1] === "male") {
        state.matrimonyprofileImages.male = action.payload[0];
      } else if (action.payload[1] === "female") {
        state.matrimonyprofileImages.female = action.payload[0];
      }
      // state.matrimonyprofileImages = action.payload;
    },

    setLikedBy: (state, action) => {
      state.likedBy = action.payload;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
    },
    logoutSuccess: (state, action) => {
      state.user = null;
      state.token = null;
      state.refresh_token = null;
      state.likedBy = [];
      state.localChats = [];
      state.conversations = [];
      state.cloudChats = [];
      state.matrimonyprofileImages.male = [];
      state.matrimonyprofileImages.female = [];
      state.socialData.friendRequest = [];
      state.socialData.requestCount = 0;
      state.socialData.friendsCount = 0;
      state.socialData.friends = [];
    },
    setInitialUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refresh_token = action.payload.refreshToken;
    },
    updateTokens: (state, action) => {
      state.token = action.payload.accessToken;
      state.refresh_token = action.payload.refreshToken;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadingInBtn: (state, action) => {
      state.loadingInBtn = action.payload;
    },
    setError: (state, action) => {
      state.error.msg = action.payload.msg;
      state.error.toggle = action.payload.toggle;
      state.error.type = action.payload.type;
    },
    updatelocalchats: (state, action) => {
      state.localChats = action.payload;
    },
    updatecloudchats: (state, action) => {
      state.cloudChats = action.payload;
    },
    updateconversation: (state, action) => {
      state.conversations = action.payload;
    },
    updatesocket: (state, action) => {
      state.socket = action.payload;
    },
    updateSocialDataFriendsCount: (state, action) => {
      state.socialData.friendsCount = action.payload;
    },
    updateSocialDataRequestCount: (state, action) => {
      state.socialData.requestCount = action.payload;
    },
    updateSocialDataFriends: (state, action) => {
      state.socialData.friends = action.payload;
    },
    updateSocialDataFriendsRequest: (state, action) => {
      state.socialData = { ...state.socialData, friendRequest: action.payload };
    },
    updateSocialData: (state, action) => {
      state.socialData = action.payload;
    },
    updateHomeScreenNotification: (state, action) => {
      state.notification.homescreen = action.payload;
    },
    updateSocialScreenNotification: (state, action) => {
      state.notification.meetup = action.payload;
    },
    updateNotification: (state, action) => {
      state.notification = action.payload;
    },
    updateMatrimonyProfile: (state, action) => {
      state.myMatrimonyProfile = action.payload;
    },

    // Temple Module
    updateTemple: (state, action) => {
      state.temple = action.payload;
    },
  },
});
export default slice.reducer;

export const {
  setLikedBy,
  loadmatrimonyprofileImages,
  loginSuccess,
  logoutSuccess,
  setInitialUser,
  updateTokens,
  setLoading,
  setError,
  updatelocalchats,
  updatecloudchats,
  updateconversation,
  setLoadingInBtn,
  updateSocialDataFriendsCount,
  updateSocialDataRequestCount,
  updateSocialDataFriends,
  updateSocialDataFriendsRequest,
  updateHomeScreenNotification,
  updateSocialScreenNotification,
  updateMatrimonyProfile,

  updateSocialData,
  updateNotification,

  updateTemple,
} = slice.actions;

// export const UpdateMatrimonyImages = (images) => (dispatch) => {
//   dispatch(loadmatrimonyprofileImages(images));
// };



export const updateSocket = (socket) => async (dispatch) => {
  dispatch(updatesocket(socket));
};

export const updateLocalChats = (localChats) => async (dispatch) => {
  dispatch(updatelocalchats(localChats));
  await AsyncStorage.setItem("localChats", JSON.stringify(localChats));
};

export const updateCloudChats = (cloudChats) => async (dispatch) => {
  await AsyncStorage.setItem("cloudChats", JSON.stringify(cloudChats));
  dispatch(updateCloudChats(cloudChats));
};
export const updateConversation = (convo) => async (dispatch) => {
  dispatch(updateconversation(convo));
  if (convo.length > 0)
    await AsyncStorage.setItem("coversation", JSON.stringify(convo));
  else await AsyncStorage.removeItem("coversation");
};

export const Isloading = (loading) => (dispatch) => {
  dispatch(setLoading(loading));
};
export const IsBttnloading = (loading) => (dispatch) => {
  dispatch(setLoadingInBtn(loading));
};
export const ErrorToggle = (data) => (dispatch) => {
  dispatch(setError(data));
};

// export const login =
//   ({ email, password }) =>
//   async (dispatch) => {
//     try {
//       const res = await axios.post(BASEAPIURL + "/user/login", {
//         email,
//         password,
//         // userType: "U",
//       });
//       console.log("res", res);
//       console.log("resdata", res.data)
//       console.log("resdatastatus", res.data.status)

//       if (res.data) {
//         console.log(res.data);
//         await AsyncStorage.setItem("token", res.data.token);
//         await AsyncStorage.setItem("refresh_token", res.data.refreshToken);
//         await dispatch(
//           setInitialUser({
//             user: res.data.user,
//             token: res.data.token,
//             refreshToken: res.data.refreshToken,
//           })
//         );

//         return true;
//       } else {
//         if (res.data.msgCode !== 5)
//           if (res.data.msgCode === 1) {
//             await dispatch(
//               setError({
//                 msg: "User not found. Please register.",
//                 toggle: true,
//                 type: "error",
//               })
//             );
//           } else
//             await dispatch(
//               setError({
//                 msg: "Invalid credentials. Please try again.",
//                 toggle: true,
//                 type: "error",
//               })
//             );
//         return res.data;
//       }
//     } catch (e) {
//       console.log(e);
//       await dispatch(
//         setError({
//           msg: "Server Error!!",
//           toggle: true,
//           type: "error",
//         })
//       );
//       return false;
//     }
//   };

export const login = ({ email, password, isAdmin }) => async (dispatch) => {
  try {
    // Validate email and password before making the request
    if (!email || !password) {
      await dispatch(
        setError({
          msg: 'Email and password are required.',
          toggle: true,
          type: 'error',
        })
      );
      return false;
    }

    // Attempt to login
    let res;
    if(isAdmin === "false"){
       res = await axios.post(`${BASEAPIURL}/user/login`, {
        email,
        password,
      });
    }else{
       res = await axios.post(`${BASEAPIURL}/super-admin-auth/login`, {
        email,
        password,
      });
    }
    console.log(res);

    // Check for successful response
    if (res.status === 200 && res.data) {
      const { accessToken, refreshToken, user } = res.data;

      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('token', accessToken);
      // await AsyncStorage.setItem('refresh_token', refreshToken);

      // Set user data in the state
      await dispatch(
        setInitialUser({
          user,
          token: accessToken,
          refreshToken,
        })
      );

      return true; // Indicate successful login
    } else {
      // If the response does not indicate success, handle different error scenarios
       const errorMsg = res.data?.message || 'Login failed. Please try again.';

      await dispatch(
        setError({
          msg: errorMsg,
          toggle: true,
          type: 'error',
        })
      );

      return false;
    }
  } catch (error) {
    // Handle network or server errors
    console.error('Login error:', error);

    if (error.response) {
      const status = error.response.status;

      let errorMsg = 'An unexpected error occurred. Please try again.';

      if (status === 401) {
        errorMsg = 'Invalid credentials. Please check your email and password.';
      } else if (status === 500) {
        errorMsg = 'Internal server error. Please try again later.';
      }

      await dispatch(
        setError({
          msg: errorMsg,
          toggle: true,
          type: 'error',
        })
      );
    } else {
      // Handle connection issues
      await dispatch(
        setError({
          msg: 'Network error. Please check your internet connection and try again.',
          toggle: true,
          type: 'error',
        })
      );
    }
    return false;
  }
};

// export const signup = (data) => async (dispatch) => {
//   try {
//     data.firstName = data.firstName.trim();
//     data.lastName = data.lastName.trim();
//     data.email = data.email.trim();
//     // data.phone = data.phone.trim();
//     // data.username = data.username.trim();
//     data.password = data.password.trim();

//     const res = await axios.post(BASEAPIURL + "/user/register", data);
//     if (res.data.status !== 0) {
//       await dispatch(
//         setError({ msg: res.data.msg, toggle: true, type: "error" })
//       );
//     } else {
//       await dispatch(
//         setError({
//           msg: "Entered OTP Sent to your number",
//           toggle: true,
//           type: "Success",
//         })
//       );
//     }
//     return res.data;
//   } catch (e) {
//     if (e.response && e.response.data && e.response.data.status === 1) {
//       return await dispatch(
//         setError({ msg: e.response.data.msg, toggle: true, type: "error" })
//       );
//     } else {
//       return await dispatch(
//         setError({
//           msg: "There was some error while registering. Please Try Again!",
//           toggle: true,
//           type: "error",
//         })
//       );
//     }
//   }
// };
export const signup = (userData) => async (dispatch) => {
  try {
    const trimmedData = {
      ...userData,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim(),
      password: userData.password.trim(),
      phone: userData.phone.trim(),
     // data.username = data.username.trim();
      // Additional fields can be trimmed as needed
    };

    const res = await axios.post(`${BASEAPIURL}/user/register`, trimmedData);
    if (res.status === 201) {
      // Handle successful response
      await dispatch(
        setError({
          msg: 'An OTP has been sent to your phone number.',
          toggle: true,
          type: 'success',
        })
      );
      return res.data;
    }

    // Handle non-successful status codes (e.g., status !== 201)
    await dispatch(
      setError({
        msg: res.data?.msg || 'Unexpected error occurred during signup.',
        toggle: true,
        type: 'error',
      })
    );
  } catch (error) {
    // Handle specific error cases with detailed messages
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.msg || 'An error occurred during signup.';

      if (status === 400) {
        await dispatch(
          setError({
            msg: 'Invalid input. Please check your data and try again.',
            toggle: true,
            type: 'error',
          })
        );
      } else if (status === 401) {
        await dispatch(
          setError({
            msg: 'Unauthorized. Please check your credentials.',
            toggle: true,
            type: 'error',
          })
        );
      } else {
        await dispatch(
          setError({
            msg: errorMsg,
            toggle: true,
            type: 'error',
          })
        );
      }
    } else {
      // Handle cases where error doesn't have a response
      await dispatch(
        setError({
          msg: 'Network error. Please check your internet connection and try again.',
          toggle: true,
          type: 'error',
        })
      );
    }
    return false;
  }
};

export const verifyOTP = (data) => async (dispatch) => {
  try {
    const res = await axios.post(BASEAPIURL + "/auth/verify-otp", data);
    if (res.data.status !== 0) {
      await dispatch(
        setError({ msg: res.data.msg, toggle: true, type: "error" })
      );
    } else {
      if (data.type === "login" || data.type === "register")
        return { status: 0 };
      else
        await dispatch(
          setError({
            msg: "OTP Verified Successfully. Login again",
            toggle: true,
            type: "Success",
          })
        );
    }
    return res.data;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.status === 1) {
      return await dispatch(
        setError({ msg: e.response.data.msg, toggle: true, type: "error" })
      );
    } else {
      return await dispatch(
        setError({
          msg: "There was some error while verifying OTP. Please Try Again!",
          toggle: true,
          type: "error",
        })
      );
    }
  }
};

// Edit my profile
export const editMyProfile = (formData) => async (dispatch) => {
  const res = await axios.patch(`${BASEAPIURL}/auth/user-details`, formData, {
    headers: await authHeader(),
  });
  if (res.data.status === 0) {
    await dispatch(
      setError({ msg: res.data.msg, toggle: true, type: "Success" })
    );
  } else {
    await dispatch(
      setError({
        msg: "There was some error. Please Try Again after some time",
        toggle: true,
        type: "error",
      })
    );
  }
  return res.data;
};

export const initialUser = (token, refreshtoken) => async (dispatch) => {
  try {
    const user = await getUserData();
    if (user && user.status === 0) {
      return dispatch(
        setInitialUser({ user: user.data, token, refreshToken: refreshtoken })
      );
    } else {
      return dispatch(
        generateToken(await AsyncStorage.getItem("refresh_token"))
      );
    }
  } catch (e) {
    return;
  }
};

export const generateToken = (refreshToken) => async (dispatch) => {
  try {
    const res = await getUpdatedTokens(refreshToken);
    console.log(res);
    if (res && res.status === 0) {
      await AsyncStorage.setItem("token", res.accessToken);
      await AsyncStorage.setItem("refresh_token", res.refreshToken);
      await dispatch(initialUser(res.accessToken, res.refreshToken));
    } else {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refresh_token");
      await dispatch(
        setError({
          msg: "Your Session expired. Kindly Login Again.",
          toggle: true,
          type: "error",
        })
      );
      return dispatch(logoutSuccess());
    }
  } catch (e) {}
};

// export const imgHandler
export const logout = () => async (dispatch) => {
  try {
    const headers = await authHeader();
    const res = await axios.post(`${BASEAPIURL}/user/logout`, {}, { headers });

    if (res.status === 200) {
      await dispatch(
        setError({
          msg: "Logged out Successfully",
          toggle: true,
          type: "Success",
        })
      );
      await AsyncStorage.clear();
      return dispatch(logoutSuccess());
    }  else if (res.status === 401) {
      await dispatch(
        setError({
          msg: "Logged out Successfully",
          toggle: true,
          type: "Success",
        })
      );
      await AsyncStorage.clear();
      return dispatch(logoutSuccess());
    }
    else {
      await dispatch(
        setError({
          msg: "There was some error. Please try again after some time",
          toggle: true,
          type: "error",
        })
      );
    }
  } catch (error) {
    await dispatch(
      setError({
        msg: "There was some error. Please try again after some time",
        toggle: true,
        type: "error",
      })
    );
  }
};

export const deleteAccountHandler = () => async (dispatch) => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("refresh_token");
  dispatch(logoutSuccess());
};

// Notification Handling

export const setHomeScreenNotification = (data) => async (dispatch) => {
  if (data) {
    await AsyncStorage.setItem("homeScreenNotification", JSON.stringify(data));
    await dispatch(updateHomeScreenNotification(data));
  } else {
    await AsyncStorage.removeItem("homeScreenNotification");
    await dispatch(updateHomeScreenNotification([]));
  }
};

export const setSocialScreenNotification = (data) => async (dispatch) => {
  if (data) {
    await AsyncStorage.setItem(
      "socialScreenNotification",
      JSON.stringify(data)
    );
    await dispatch(updateSocialScreenNotification(data));
  } else {
    await AsyncStorage.removeItem("socialScreenNotification");
    await dispatch(updateSocialScreenNotification([]));
  }
};

export const setMatrimonyProfile = (data) => async (dispatch) => {
  if (data) {
    AsyncStorage.setItem("matrimonyProfile", JSON.stringify(data));
    await dispatch(updateMatrimonyProfile(data));
  } else {
    await AsyncStorage.removeItem("matrimonyProfile");
    await dispatch(updateMatrimonyProfile([]));
  }
};
