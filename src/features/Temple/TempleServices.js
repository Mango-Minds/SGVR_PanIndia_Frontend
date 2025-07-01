import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper to get token
const getToken = async () => {
  const token = await AsyncStorage.getItem("token");
  console.log("token: ", token);
  if (!token) throw new Error("Unauthorized");
  return token;

  
};


export const addGodToTemple = async (templeId, registerDetails, selectedImages, dispatch, setLoadingInBtn) => {
    const token = await getToken();
    try {
      if (!token) {
        console.error("Bearer token not found");
        return;
      }
  
      const formData = new FormData();
      formData.append("godName", registerDetails.godName);
      formData.append("description", registerDetails.godDescription);
      formData.append("symbol", registerDetails.godSymbol);
      formData.append("festivals", registerDetails.godFestivals);
      formData.append("relatedDeities", registerDetails.godRelatedDeities);
  
      selectedImages.forEach((image, index) => {
        formData.append("godImage", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });
  
      await dispatch(setLoadingInBtn(true));
  
      const response = await apiClient.post(`/temple/${templeId}/gods`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      await dispatch(setLoadingInBtn(false));
  
      return response;
    } catch (error) {
      await dispatch(setLoadingInBtn(false));
      console.error("Error adding god:", error);
      throw error;
    }
  };

  export const addMemberToTemple = async (templeId, registerDetails, selectedImages, dispatch, setLoadingInBtn) => {
    const token = await getToken();
    try {
      if (!token) {
        console.error("Bearer token not found");
        return;
      }
  
      const formData = new FormData();
      formData.append("name", registerDetails.memberName);
      formData.append("designation", registerDetails.memberDesignation);
      formData.append("email", registerDetails.memberEmail);
      formData.append("phone", registerDetails.memberPhone);
      formData.append("location", registerDetails.memberLocation);
      formData.append("description", registerDetails.memberDescription);
  
      selectedImages.forEach((image, index) => {
        formData.append("profileImage", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });
  
      await dispatch(setLoadingInBtn(true));
  
      const response = await apiClient.post(`/temple/${templeId}/members`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      await dispatch(setLoadingInBtn(false));
  
      return response;
    } catch (error) {
      await dispatch(setLoadingInBtn(false));
      console.error("Error adding member:", error);
      throw error;
    }
  };
  
  