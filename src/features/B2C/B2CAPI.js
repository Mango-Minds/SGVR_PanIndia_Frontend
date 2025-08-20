import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import apiClient from "../../store/apiClient";
import { setLoadingInBtn } from "../../store/user";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
export const addProductAPI = async ({
  registerDetails,
  selectedImages,
  setLoading,
  fetchProducts,
  navigation,
  resetForm,
  t,
}) => {
  try {
    let token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert(t("error"), t("authTokenMissing")); 
      return;
    }



    const formData = new FormData();
    formData.append("name", registerDetails.productName);
    formData.append("price", parseFloat(registerDetails.productPrice));
    formData.append(
      "originalPrice",
      parseFloat(registerDetails.productOriginalPrice)
    );
    formData.append("category", registerDetails.productCategory);
    formData.append("subcategory", registerDetails.productSubCategory);
    formData.append("description", registerDetails.productDescription);
    formData.append("condition", registerDetails.productCondition);
    formData.append("productAge", registerDetails.productAge);
    formData.append("address", registerDetails.address);
    formData.append("phone", registerDetails.phone);
    // Only append address_link if it's not empty
    if (registerDetails.address_link && registerDetails.address_link.trim()) {
      formData.append("address_link", registerDetails.address_link);
    }



    selectedImages.forEach((media, index) => {
      let mimeType = "";
      let fileName = "";
      let fieldName = "";

      if (media.uri) {
        // Determine media type based on file extension or mimeType
        const uri = media.uri.toLowerCase();
        if (uri.includes('.jpg') || uri.includes('.jpeg') || uri.includes('.png') || uri.includes('.gif') || media.mimeType?.includes('image')) {
          mimeType = media.mimeType || "image/jpeg";
          fileName = `image_${index}.jpg`;
          fieldName = "images";
        } else if (uri.includes('.mp4') || uri.includes('.mov') || uri.includes('.avi') || media.mimeType?.includes('video')) {
          mimeType = media.mimeType || "video/mp4";
          fileName = `video_${index}.mp4`;
          fieldName = "videos";
        } else if (uri.includes('.pdf') || uri.includes('.doc') || uri.includes('.docx') || media.mimeType?.includes('application')) {
          mimeType = media.mimeType || "application/pdf";
          fileName = `document_${index}.pdf`;
          fieldName = "documents";
        } else {
          // Default to image if type cannot be determined
          console.log(`Unknown media type, defaulting to image: ${media.uri}`);
          mimeType = "image/jpeg";
          fileName = `image_${index}.jpg`;
          fieldName = "images";
        }

    

        formData.append(fieldName, {
          uri: media.uri,
          name: fileName,
          type: mimeType,
        });
      }
    });

    setLoading(true);



    const response = await apiClient.post("/listings/create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setLoading(false);

    if (!response.data || response.status !== 201) {
      console.error("API Response:", response);
      throw new Error("Failed to add product");
    }

    fetchProducts();
    resetForm();

   Alert.alert(t("success"), t("productCreated"), [
  { text: t("ok"), onPress: () => navigation.goBack() },
]);
  } catch (error) {
    console.error("Error adding product:", error);

    
    // Try to get more specific error message from the response
    let errorMessage = t("addProductFailed");
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (error.response?.status === 401) {
      errorMessage = "Authentication failed. Please login again.";
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || "Invalid data provided.";
    } else if (error.response?.status === 500) {
      // Check if it's a phone number validation error
      if (error.response.data?.error && error.response.data.error.includes('phone')) {
        errorMessage = "Phone number is required. Please update your profile with a phone number and try again.";
      } else {
        errorMessage = "Server error. Please try again later.";
      }
    } else if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Check if it's a phone number error and provide navigation option
    if (error.response?.status === 500 && error.response.data?.error && error.response.data.error.includes('phone')) {
      Alert.alert(
        t("error"), 
        "Phone number is required. Please update your profile with a phone number and try again.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Update Profile", 
            onPress: () => {
              // Navigate to profile update page
              navigation.navigate('Profile'); // Adjust the route name as needed
            }
          }
        ]
      );
    } else {
      Alert.alert(t("error"), errorMessage, [{ text: t("ok") }]);
    }
    setLoading(false);
  }
};

//correct one
// export const fetchProducts = async (
//     searchTerm,
//     selectedFiltersArray = [],
//     sortOption,
//     setProducts,
//     setLoadingAnimation
//   ) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token missing.");
//         return;
//       }

//       const queryParams = new URLSearchParams();

//       selectedFiltersArray.forEach((filter) => {
//         const name = filter["Filter name"]?.toLowerCase().trim();
//         const options = filter.Options || [];

//         if (name === "category") {
//           options.forEach((option) =>
//             queryParams.append("category", option.toLowerCase().trim())
//           );
//         } else if (name === "condition") {
//           options.forEach((option) =>
//             queryParams.append("condition", option.toLowerCase().trim())
//           );
//         } else if (name === "price") {
//           options.forEach((option) => {
//             if (/below/i.test(option)) {
//               const match = option.match(/\d+/);
//               if (match) queryParams.append("maxPrice", match[0]);
//             } else if (/above/i.test(option)) {
//               const match = option.match(/\d+/);
//               if (match) queryParams.append("minPrice", match[0]);
//             } else {
//               const [min, max] = option.split("-").map((v) => v.trim());
//               queryParams.append("minPrice", min);
//               queryParams.append("maxPrice", max);
//             }
//           });
//         }
//       });

//       if (searchTerm?.trim()) {
//         queryParams.append("search", searchTerm.trim());
//       }

//       if (sortOption) {
//         queryParams.append("priceSort", sortOption);
//       }

//       const queryString = queryParams.toString();
//       const url = `/listings?${queryString}`;

//       console.log("Fetching products with URL:", url);

//       setLoadingAnimation(true);

//       const response = await apiClient.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200 && response.data) {
//         console.log("Data:", response.data);
//         setProducts(response.data.listings);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       Alert.alert("Error", "Failed to fetch products.");
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };

export const fetchProducts = async (
  searchTerm,
  selectedFiltersArray = [],
  sortOption,
  setProducts,
  setLoadingAnimation
) => {
  try {
    console.log("📦 fetchProducts called with:");
    console.log("searchTerm:", searchTerm);
    console.log("selectedFiltersArray:", selectedFiltersArray);
    console.log("sortOption:", sortOption);

    const token = await AsyncStorage.getItem("token");
    const userLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    if (!token) {
      console.error("❌ Bearer token not found");
      Alert.alert("Error", "Authentication token missing.");
      return;
    }

    console.log("✅ Token and userLanguage fetched:", { token, userLanguage });

    const queryParams = new URLSearchParams();

    selectedFiltersArray.forEach((filter) => {
      const name = filter["Filter name"]?.toLowerCase().trim();
      const options = filter.Options || [];

      console.log("🔎 Processing filter:", { name, options });

      if (name === "category") {
        options.forEach((option) =>
          queryParams.append("category", option.toLowerCase().trim())
        );
      } else if (name === "condition") {
        options.forEach((option) =>
          queryParams.append("condition", option.toLowerCase().trim())
        );
      } else if (name === "price") {
        options.forEach((option) => {
          if (/below/i.test(option)) {
            const match = option.match(/\d+/);
            if (match) {
              console.log("💰 Applying maxPrice from 'below':", match[0]);
              queryParams.append("maxPrice", match[0]);
            }
          } else if (/above/i.test(option)) {
            const match = option.match(/\d+/);
            if (match) {
              console.log("💰 Applying minPrice from 'above':", match[0]);
              queryParams.append("minPrice", match[0]);
            }
          } else {
            const [min, max] = option.split("-").map((v) => v.trim());
            console.log("💰 Applying price range:", { min, max });
            queryParams.append("minPrice", min);
            queryParams.append("maxPrice", max);
          }
        });
      }
    });

    if (searchTerm?.trim()) {
      queryParams.append("search", searchTerm.trim());
    }

    if (sortOption) {
      queryParams.append("priceSort", sortOption);
    }

    const queryString = queryParams.toString();
    const url = `listings?${queryString}`;

    console.log("🌐 Final API URL:", url);

    setLoadingAnimation(true);

    const response = await apiClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ API response received:", response?.data);

    let listings = response.data?.listings || [];

    if (!listings.length) {
      console.warn("⚠️ No listings returned from API.");
    }

    if (userLanguage !== "en" && listings.length > 0) {
      try {
        console.log(
          `🌐 Translating ${listings.length} listings to "${userLanguage}"...`
        );

        const translationRes = await fetch(`${BASEAPIURL}/translate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: listings,
            targetLang: userLanguage,
          }),
        });

        const result = await translationRes.json();
        console.log("🈯 Translation response:", result);

        if (result.success) {
          listings = result.translatedData;
        } else {
          console.warn("⚠️ Translation failed:", result.error);
        }
      } catch (err) {
        console.error("❌ Error translating listings:", err);
      }
    }

    console.log("✅ Final listings to set:", listings);
    setProducts(listings);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    Alert.alert("Error", "Failed to fetch products.");
  } finally {
    setLoadingAnimation(false);
  }
};

//correct
// export const fetchAllProducts = async (searchTerm, selectedFiltersArray = []) => {
//   try {
//     let token = await AsyncStorage.getItem("token");

//     if (!token) {
//       console.error("Bearer token not found");
//       Alert.alert("Error", "Authentication token missing.");
//       return [];
//     }

//     const queryParams = new URLSearchParams();

//     selectedFiltersArray.forEach((filter) => {
//       if (filter["Filter name"] === "Category") {
//         filter.Options.forEach((option) =>
//           queryParams.append("category", option.toLowerCase())
//         );
//       } else if (filter["Filter name"] === "Sub Category") {
//         filter.Options.forEach((option) =>
//           queryParams.append("subcategory", option.toLowerCase())
//         );
//       } else if (filter["Filter name"] === "Condition") {
//         filter.Options.forEach((option) =>
//           queryParams.append("condition", option.toLowerCase())
//         );
//       }
//     });

//     if (searchTerm.trim() !== "") {
//       queryParams.append("search", searchTerm);
//     }

//     const queryString = queryParams.toString();
//     console.log("Fetching products with query:", queryString);

//     const response = await apiClient.get(`/listings?${queryString}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response.data?.listings || [];
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     Alert.alert("Error", "Failed to fetch products.");
//     return [];
//   }
// };

export const fetchAllProducts = async (
  searchTerm,
  selectedFiltersArray = []
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const selectedLanguage =
      (await AsyncStorage.getItem("user-language")) || "en";

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert("Error", "Authentication token missing.");
      return [];
    }

    const queryParams = new URLSearchParams();

    selectedFiltersArray.forEach((filter) => {
      if (filter["Filter name"] === "Category") {
        filter.Options.forEach((option) =>
          queryParams.append("category", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "Sub Category") {
        filter.Options.forEach((option) =>
          queryParams.append("subcategory", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "Condition") {
        filter.Options.forEach((option) =>
          queryParams.append("condition", option.toLowerCase())
        );
      }
    });

    if (searchTerm.trim() !== "") {
      queryParams.append("search", searchTerm);
    }

    const queryString = queryParams.toString();
    console.log("Fetching products with query:", queryString);

    const response = await apiClient.get(`/listings?${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let listings = response.data?.listings || [];

    // 🌐 Translate only if language is not English
    if (selectedLanguage !== "en" && listings.length > 0) {
      const translateResponse = await apiClient.post("/translate", {
        data: listings,
        targetLang: selectedLanguage,
      });

      if (translateResponse?.data?.success) {
        listings = translateResponse.data.translatedData;
      }
    }

    return listings;
  } catch (error) {
    console.error("Error fetching products:", error);
    Alert.alert("Error", "Failed to fetch products.");
    return [];
  }
};

//correct
// export const fetchSingleProduct = async (itemId) => {
//   try {
//     let token = await AsyncStorage.getItem("token");

//     if (!token) {
//       console.error("Bearer token not found");
//       Alert.alert("Error", "Authentication token is missing.");
//       return null;
//     }

//     const response = await apiClient.get(`/listings/${itemId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response.data?.listing;
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     Alert.alert("Error", "Failed to fetch product.");
//     return null;
//   }
// };
export const fetchSingleProduct = async (itemId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const selectedLanguage =
      (await AsyncStorage.getItem("user-language")) || "en";

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert("Error", "Authentication token is missing.");
      return null;
    }

    // Fetch product by ID
    const response = await apiClient.get(`/listings/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let product = response.data?.listing;

    if (!product) {
      throw new Error("Product not found.");
    }

    // 🌐 Translate if necessary
    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: [product], // send as array
        targetLang: selectedLanguage,
      });

      if (translateResponse?.data?.success) {
        product = translateResponse.data.translatedData[0];
      }
    }

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    Alert.alert("Error", "Failed to fetch product.");
    return null;
  }
};

export const deleteSingleProduct = async (itemId) => {
  try {
    let token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert("Error", "Authentication token is missing.");
      return false;
    }

    const response = await apiClient.delete(`/listings/delete/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    Alert.alert("Error", `Something went wrong: ${error.message}`);
    return false;
  }
};

export const connectToChat = async ({
  owner_id,
  business_id,
  productData,
  navigation,
}) => {
  if (owner_id === business_id) {
    console.log("Chat room cannot be created: same ID");
    return;
  }

  try {
    let token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert("Error", "Authentication token is missing.");
      return;
    }

    // Step 1: Create chat room
    const response = await apiClient.post(
      "/chat/room/",
      { userIds: [owner_id, business_id] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Chat room creation response:", response);

    // Step 2: Fetch all chat rooms
    const roomResponse = await apiClient.get("/chat/rooms/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (roomResponse.data && roomResponse.data.rooms.length > 0) {
      const room_with_user = roomResponse.data.rooms.find(
        (room) => room?.participants[0]?.id === business_id
      );

      if (!room_with_user) {
        Alert.alert("Error", "No chat room found for this user.");
        return;
      }

      const initialMessage = `Hi, I have a query about this product: ${productData?.name}\n Price: Rs. ${productData.price} \n\nCan you provide more details?`;

      Alert.alert("OK", "Chat Room Created", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("ChatScreenNew", {
              user_auth_token: token,
              room: room_with_user,
              participant_name: `${room_with_user.participants[0].firstName} ${room_with_user.participants[0].lastName}`,
              initialMessage,
            });
          },
        },
      ]);
    } else {
      Alert.alert("No rooms found");
    }
  } catch (error) {
    console.error("Error connecting to chat:", error);
    Alert.alert("Error", "Something went wrong while creating the chat room.");
  }
};
export const updateListing = async ({
  listing,
  modifiedDetails,
  selectedImages,
  uploadedImages,
  selectedVideos,
  uploadedVideos,
  productId,
  fetchProduct,
  navigation,
  dispatch,
  t,
}) => {
  try {
    await dispatch(setLoadingInBtn(true));

    let token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert(t("error"), t("authTokenMissing"));
      await dispatch(setLoadingInBtn(false));
      return;
    }

    const formData = new FormData();

    Object.keys(modifiedDetails).forEach((key) => {
      if (modifiedDetails[key] !== listing[key]) {
        formData.append(key, modifiedDetails[key]);
      }
    });
    
    // selectedImages.forEach((image, index) => {
    //   formData.append("images", {
    //     uri: image.uri,
    //     name: `selected_image_${index}.jpg`,
    //     type: "image/jpeg",
    //   });
    // });

     selectedImages.forEach((image) => {
        formData.append("images", image);
      });
    uploadedImages.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        //name: `uploaded_image_${index}.jpg`,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      });
    });

    
    // selectedVideos.forEach((video, index) => {
    //   formData.append("videos", {
    //     uri: video.uri,
    //     name: `selected_video_${index}.mp4`,
    //     type: "video/mp4",
    //   });
    // });
    selectedVideos.forEach((video) => {
        formData.append("videos", video);
      });

    uploadedVideos.forEach((video, index) => {
      if (!video.uri) {
        console.error(`Video at index ${index} has an invalid URI:`, video);
        return;
      }
      formData.append("videos", {
        uri: video.uri,
        name: video.name || `uploaded_video_${index}.mp4`,
        type: video.type || "video/mp4",
      });
    });

    const response = await apiClient.put(
      `/listings/edit/${listing._id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("resp: ", response);
    console.log("API Response:", response.data);
    await dispatch(setLoadingInBtn(false));

    Alert.alert(t("success"), t("listingUpdated"));
    fetchProduct();
    navigation.goBack();
  } catch (error) {
    console.error("Error updating product:", error);
    Alert.alert(t("error"), t("listingUpdateFailed"));
    await dispatch(setLoadingInBtn(false));
  }
};

// export const updateUserProfile = async ({
//   firstName,
//   lastName,
//   email,
//   phone,
//   address,
//   selectedImage,
//   userId,
//   dispatch,
//   setLoadingInBtn,
//   fetchUser,
//   navigation,
// }) => {
//   try {
//     let token = await AsyncStorage.getItem("token");

//     if (!token) {
//       console.error("Bearer token not found");
//       Alert.alert("Error", "Authentication token is missing.");
//       return;
//     }

//     let formData = new FormData();
//     formData.append("firstName", firstName);
//     formData.append("lastName", lastName);
//     formData.append("email", email);
//     formData.append("phone", phone);

//     formData.append("address", address);

//     if (selectedImage && selectedImage.uri) {
//       let localUri = selectedImage.uri;
//       let filename = localUri.split("/").pop();
//       let match = /\.(\w+)$/.exec(filename);
//       let type = match ? `image/${match[1]}` : "image/jpeg";

//       formData.append("image", { uri: localUri, name: filename, type });
//     }

//     // Set loading state true
//     await dispatch(setLoadingInBtn(true));

//     const fullUrl = `/user/update/${userId}`;

//     const response = await apiClient.patch(fullUrl, formData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // Set loading state false
//     await dispatch(setLoadingInBtn(false));

//     console.log("API Response:", response.data);

//     Alert.alert("Success", "Information Updated Successfully");

//     fetchUser();
//     navigation.goBack();
//   } catch (error) {
//     console.error("Error updating user:", error);
//     Alert.alert("Error", "Failed to update user information.");
//     await dispatch(setLoadingInBtn(false));
//   }
// };

export const updateUserProfile = async ({
  firstName,
  lastName,
  email,
  phone,
  address,
  selectedImage,
  userId,
  dispatch,
  setLoadingInBtn,
  fetchUser,
  navigation,
}) => {
  try {
    let token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert("Error", "Authentication token is missing.");
      return;
    }

    let formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);



    if (selectedImage && selectedImage.uri) {
      let localUri = selectedImage.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", { uri: localUri, name: filename, type });
    }

    await dispatch(setLoadingInBtn(true));

    const fullUrl = `/user/update/${userId}`;

    const response = await apiClient.patch(fullUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    await dispatch(setLoadingInBtn(false));

    console.log("API Response:", response.data);

    Alert.alert("Success", "Information Updated Successfully");

    fetchUser();
    navigation.goBack();
  } catch (error) {
    console.error("Error updating user:", error);
    Alert.alert("Error", "Failed to update user information.");
    await dispatch(setLoadingInBtn(false));
  }
};

export const reportPostApi = (postId, reason) => {
  return apiClient.post(`/listings/report-listing/${postId}`, { reason });
};

export const fetchUserListings = async (
  searchTerm = "",
  selectedFiltersArray = [],
  sortOption = "",
  userId,
  setProducts = () => {},
  setLoadingAnimation = () => {}
) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Authentication token is missing.");
      Alert.alert("Error", "You are not authorized. Please log in again.");
      return;
    }

    const queryParams = new URLSearchParams();

    selectedFiltersArray.forEach((filter) => {
      const filterName = filter["Filter name"];

      if (filterName === "Category") {
        filter.Options.forEach((option) =>
          queryParams.append("category", option.toLowerCase())
        );
      } else if (filterName === "Condition") {
        filter.Options.forEach((option) =>
          queryParams.append("condition", option.toLowerCase())
        );
      } else if (filterName === "Price") {
        filter.Options.forEach((option) => {
          if (option.includes("Below")) {
            queryParams.append("maxPrice", option.split(" ")[1]);
          } else if (option.includes("Above")) {
            queryParams.append("minPrice", option.split(" ")[1]);
          } else {
            const [minPrice, maxPrice] = option.split("-");
            queryParams.append("minPrice", minPrice);
            queryParams.append("maxPrice", maxPrice);
          }
        });
      }
    });

    if (searchTerm.trim()) {
      queryParams.append("search", searchTerm);
    }

    if (sortOption) {
      queryParams.append("priceSort", sortOption);
    }

    const queryString = queryParams.toString();
    const url = `/listings/all/${userId}?${queryString}`;

    console.log("Fetching products with URL:", url);
    setLoadingAnimation(true);

    const response = await apiClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      console.log("Data:", response.data);
      setProducts(response.data.listings || []);
    } else {
      throw new Error(`Failed to fetch products. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching user listings:", error);
    Alert.alert("Error", "Unable to fetch listings. Please try again later.");
  } finally {
    setLoadingAnimation(false);
  }
};
export const fetchUserDetails = async ({
  userId,
  setUserData,
  setLoadingAnimation,
}) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("Authentication token is missing.");
      Alert.alert("Error", "You are not authorized. Please log in again.");
      return;
    }

    setLoadingAnimation(true);

    const response = await apiClient.get(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      console.log("User Data:", response.data);
      setUserData(response.data);
    } else {
      throw new Error(`Failed to fetch user. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    Alert.alert("Error", "Unable to fetch user data. Please try again later.");
  } finally {
    setLoadingAnimation(false);
  }
};

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Alert } from "react-native";
// import apiClient from "../../store/apiClient";
// import { setLoadingInBtn } from "../../store/user";

// export const addProductAPI = async ({
//   registerDetails,
//   selectedImages,
//   setLoading,
//   fetchProducts,
//   navigation,
//   resetForm,
// }) => {
//   try {
//     let token = await AsyncStorage.getItem("token");

//     if (!token) {
//       console.error("Bearer token not found");
//       Alert.alert("Error", "Authentication token missing.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("name", registerDetails.productName);
//     formData.append("price", parseFloat(registerDetails.productPrice));
//     formData.append("originalPrice", parseFloat(registerDetails.productOriginalPrice));
//     formData.append("category", registerDetails.productCategory);
//     formData.append("subcategory", registerDetails.productSubCategory);
//     formData.append("description", registerDetails.productDescription);
//     formData.append("condition", registerDetails.productCondition);
//     formData.append("productAge", registerDetails.productAge);
//     formData.append("address", registerDetails.address);
//     formData.append("address_link", registerDetails.address_link);

//     selectedImages.forEach((media, index) => {
//       let mimeType = "";
//       let fileName = "";
//       let fieldName = "";

//       if (media.uri) {
//         if (media.type === "image") {
//           mimeType = "image/jpeg";
//           fileName = `image_${index}.jpg`;
//           fieldName = "images";
//         } else if (media.type === "video") {
//           mimeType = "video/mp4";
//           fileName = `video_${index}.mp4`;
//           fieldName = "videos";
//         } else if (media.type === "application") {
//           mimeType = "application/pdf";
//           fileName = `document_${index}.pdf`;
//           fieldName = "documents";
//         } else {
//           console.log(`Unsupported media type: ${media.type}`);
//           return;
//         }

//         formData.append(fieldName, { uri: media.uri, name: fileName, type: mimeType });
//       }
//     });

//     setLoading(true);

//     const response = await apiClient.post("/listings/create", formData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     setLoading(false);

//     if (!response.data || response.status !== 201) {
//       throw new Error("Failed to add product");
//     }

//     fetchProducts();
//     resetForm();

//     Alert.alert("Success", "Product Created successfully", [
//       { text: "OK", onPress: () => navigation.goBack() },
//     ]);
//   } catch (error) {
//     console.error("Error adding product:", error);
//     Alert.alert("Error", "Failed to add product", [{ text: "OK" }]);
//     setLoading(false);
//   }
// };

// export const fetchProducts = async (
//     searchTerm,
//     selectedFiltersArray = [],
//     sortOption,
//     setProducts,
//     setLoadingAnimation
//   ) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token missing.");
//         return;
//       }

//       const queryParams = new URLSearchParams();

//       selectedFiltersArray.forEach((filter) => {
//         const name = filter["Filter name"]?.toLowerCase().trim();
//         const options = filter.Options || [];

//         if (name === "category") {
//           options.forEach((option) =>
//             queryParams.append("category", option.toLowerCase().trim())
//           );
//         } else if (name === "condition") {
//           options.forEach((option) =>
//             queryParams.append("condition", option.toLowerCase().trim())
//           );
//         } else if (name === "price") {
//           options.forEach((option) => {
//             if (/below/i.test(option)) {
//               const match = option.match(/\d+/);
//               if (match) queryParams.append("maxPrice", match[0]);
//             } else if (/above/i.test(option)) {
//               const match = option.match(/\d+/);
//               if (match) queryParams.append("minPrice", match[0]);
//             } else {
//               const [min, max] = option.split("-").map((v) => v.trim());
//               queryParams.append("minPrice", min);
//               queryParams.append("maxPrice", max);
//             }
//           });
//         }
//       });

//       if (searchTerm?.trim()) {
//         queryParams.append("search", searchTerm.trim());
//       }

//       if (sortOption) {
//         queryParams.append("priceSort", sortOption);
//       }

//       const queryString = queryParams.toString();
//       const url = `/listings?${queryString}`;

//       console.log("Fetching products with URL:", url);

//       setLoadingAnimation(true);

//       const response = await apiClient.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200 && response.data) {
//         console.log("Data:", response.data);
//         setProducts(response.data.listings);
//       } else {
//         throw new Error(`Failed to fetch products. Status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       Alert.alert("Error", "Failed to fetch products.");
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };

//   export const fetchAllProducts = async (searchTerm, selectedFiltersArray = []) => {
//     try {
//       let token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token missing.");
//         return [];
//       }

//       const queryParams = new URLSearchParams();

//       selectedFiltersArray.forEach((filter) => {
//         if (filter["Filter name"] === "Category") {
//           filter.Options.forEach((option) =>
//             queryParams.append("category", option.toLowerCase())
//           );
//         } else if (filter["Filter name"] === "Sub Category") {
//           filter.Options.forEach((option) =>
//             queryParams.append("subcategory", option.toLowerCase())
//           );
//         } else if (filter["Filter name"] === "Condition") {
//           filter.Options.forEach((option) =>
//             queryParams.append("condition", option.toLowerCase())
//           );
//         }
//       });

//       if (searchTerm.trim() !== "") {
//         queryParams.append("search", searchTerm);
//       }

//       const queryString = queryParams.toString();
//       console.log("Fetching products with query:", queryString);

//       const response = await apiClient.get(`/listings?${queryString}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return response.data?.listings || [];
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       Alert.alert("Error", "Failed to fetch products.");
//       return [];
//     }
//   };

//   export const fetchSingleProduct = async (itemId) => {
//     try {
//       let token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token is missing.");
//         return null;
//       }

//       const response = await apiClient.get(`/listings/${itemId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return response.data?.listing;
//     } catch (error) {
//       console.error("Error fetching product:", error);
//       Alert.alert("Error", "Failed to fetch product.");
//       return null;
//     }
//   };

//   export const deleteSingleProduct = async (itemId) => {
//     try {
//       let token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token is missing.");
//         return false;
//       }

//       const response = await apiClient.delete(`/listings/delete/${itemId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return true;
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       Alert.alert("Error", `Something went wrong: ${error.message}`);
//       return false;
//     }
//   };

//   export const connectToChat = async ({
//     owner_id,
//     business_id,
//     productData,
//     navigation,
//   }) => {
//     if (owner_id === business_id) {
//       console.log("Chat room cannot be created: same ID");
//       return;
//     }

//     try {
//       let token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token is missing.");
//         return;
//       }

//       // Step 1: Create chat room
//       const response = await apiClient.post(
//         "/chat/room/",
//         { userIds: [owner_id, business_id] },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Chat room creation response:", response);

//       // Step 2: Fetch all chat rooms
//       const roomResponse = await apiClient.get("/chat/rooms/", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (roomResponse.data && roomResponse.data.rooms.length > 0) {
//         const room_with_user = roomResponse.data.rooms.find(
//           (room) => room?.participants[0]?.id === business_id
//         );

//         if (!room_with_user) {
//           Alert.alert("Error", "No chat room found for this user.");
//           return;
//         }

//         const initialMessage = `Hi, I have a query about this product: ${productData?.name}\n Price: Rs. ${productData.price} \n\nCan you provide more details?`;

//         Alert.alert("OK", "Chat Room Created", [
//           {
//             text: "OK",
//             onPress: () => {
//               navigation.navigate("ChatScreenNew", {
//                 user_auth_token: token,
//                 room: room_with_user,
//                 participant_name: `${room_with_user.participants[0].firstName} ${room_with_user.participants[0].lastName}`,
//                 initialMessage,
//               });
//             },
//           },
//         ]);
//       } else {
//         Alert.alert("No rooms found");
//       }
//     } catch (error) {
//       console.error("Error connecting to chat:", error);
//       Alert.alert("Error", "Something went wrong while creating the chat room.");
//     }
//   };
//   export const updateListing = async ({
//     listing,
//     modifiedDetails,
//     selectedImages,
//     uploadedImages,
//     selectedVideos,
//     uploadedVideos,
//     productId,
//     fetchProduct,
//     navigation,
//     dispatch,
//   }) => {
//     try {
//       await dispatch(setLoadingInBtn(true));

//       let token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token is missing.");
//         await dispatch(setLoadingInBtn(false));
//         return;
//       }

//       const formData = new FormData();

//       Object.keys(modifiedDetails).forEach((key) => {
//         if (modifiedDetails[key] !== listing[key]) {
//           formData.append(key, modifiedDetails[key]);
//         }
//       });

//       selectedImages.forEach((image, index) => {
//         formData.append("images", {
//           uri: image.uri,
//           name: `selected_image_${index}.jpg`,
//           type: "image/jpeg",
//         });
//       });

//       uploadedImages.forEach((image, index) => {
//         formData.append("images", {
//           uri: image.uri,
//           name: `uploaded_image_${index}.jpg`,
//           type: "image/jpeg",
//         });
//       });

//       selectedVideos.forEach((video, index) => {
//         formData.append("videos", {
//           uri: video.uri,
//           name: `selected_video_${index}.mp4`,
//           type: "video/mp4",
//         });
//       });

//       uploadedVideos.forEach((video, index) => {
//         if (!video.uri) {
//           console.error(`Video at index ${index} has an invalid URI:`, video);
//           return;
//         }
//         formData.append("videos", {
//           uri: video.uri,
//           name: video.name || `uploaded_video_${index}.mp4`,
//           type: video.type || "video/mp4",
//         });
//       });

//       const response = await apiClient.put(
//         `/listings/edit/${listing._id}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       console.log("API Response:", response.data);
//       await dispatch(setLoadingInBtn(false));

//       Alert.alert("Success", "Listing updated successfully");
//       fetchProduct();
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error updating product:", error);
//       Alert.alert("Error", "Failed to update listing.");
//       await dispatch(setLoadingInBtn(false));
//     }
//   };

//   export const updateUserProfile = async ({
//     firstName,
//     lastName,
//     email,
//     phone,
//     address,
//     selectedImage,
//     userId,
//     dispatch,
//     setLoadingInBtn,
//     fetchUser,
//     navigation,
//   }) => {
//     try {
//       let token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Bearer token not found");
//         Alert.alert("Error", "Authentication token is missing.");
//         return;
//       }

//       let formData = new FormData();
//       formData.append("firstName", firstName);
//       formData.append("lastName", lastName);
//       formData.append("email", email);
//       formData.append("phone", phone);
//       formData.append("address", address);

//       if (selectedImage && selectedImage.uri) {
//         let localUri = selectedImage.uri;
//         let filename = localUri.split("/").pop();
//         let match = /\.(\w+)$/.exec(filename);
//         let type = match ? `image/${match[1]}` : "image/jpeg";

//         formData.append("image", { uri: localUri, name: filename, type });
//       }

//       // Set loading state true
//       await dispatch(setLoadingInBtn(true));

//       const fullUrl = `/user/update/${userId}`;
//       console.log("Hitting URL:", fullUrl);

//       const response = await apiClient.patch(fullUrl, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       // Set loading state false
//       await dispatch(setLoadingInBtn(false));

//       console.log("API Response:", response.data);

//       Alert.alert("Success", "Information Updated Successfully");

//       fetchUser();
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error updating user:", error);
//       Alert.alert("Error", "Failed to update user information.");
//       await dispatch(setLoadingInBtn(false));
//     }
//   };

// export const fetchUserListings = async (
//     searchTerm = "",
//     selectedFiltersArray = [],
//     sortOption = "",
//     userId,
//     setProducts = () => {},
//     setLoadingAnimation = () => {}
//   ) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Authentication token is missing.");
//         Alert.alert("Error", "You are not authorized. Please log in again.");
//         return;
//       }

//       const queryParams = new URLSearchParams();

//       selectedFiltersArray.forEach((filter) => {
//         const filterName = filter["Filter name"];

//         if (filterName === "Category") {
//           filter.Options.forEach((option) =>
//             queryParams.append("category", option.toLowerCase())
//           );
//         } else if (filterName === "Condition") {
//           filter.Options.forEach((option) =>
//             queryParams.append("condition", option.toLowerCase())
//           );
//         } else if (filterName === "Price") {
//           filter.Options.forEach((option) => {
//             if (option.includes("Below")) {
//               queryParams.append("maxPrice", option.split(" ")[1]);
//             } else if (option.includes("Above")) {
//               queryParams.append("minPrice", option.split(" ")[1]);
//             } else {
//               const [minPrice, maxPrice] = option.split("-");
//               queryParams.append("minPrice", minPrice);
//               queryParams.append("maxPrice", maxPrice);
//             }
//           });
//         }
//       });

//       if (searchTerm.trim()) {
//         queryParams.append("search", searchTerm);
//       }

//       if (sortOption) {
//         queryParams.append("priceSort", sortOption);
//       }

//       const queryString = queryParams.toString();
//       const url = `/listings/all/${userId}?${queryString}`;

//       console.log("Fetching products with URL:", url);
//       setLoadingAnimation(true);

//       const response = await apiClient.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         console.log("Data:", response.data);
//         setProducts(response.data.listings || []);
//       } else {
//         throw new Error(`Failed to fetch products. Status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error fetching user listings:", error);
//       Alert.alert("Error", "Unable to fetch listings. Please try again later.");
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   export const fetchUserDetails = async ({ userId, setUserData, setLoadingAnimation }) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         console.error("Authentication token is missing.");
//         Alert.alert("Error", "You are not authorized. Please log in again.");
//         return;
//       }

//       setLoadingAnimation(true);

//       const response = await apiClient.get(`/user/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         console.log("User Data:", response.data);
//         setUserData(response.data);
//       } else {
//         throw new Error(`Failed to fetch user. Status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       Alert.alert("Error", "Unable to fetch user data. Please try again later.");
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
