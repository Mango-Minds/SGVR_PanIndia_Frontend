import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
// Helper to get token
const getToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");
  return token;
};

const ageRanges = {
    "18-25": { ageFrom: 18, ageTo: 25 },
    "26-35": { ageFrom: 26, ageTo: 35 },
    "36-45": { ageFrom: 36, ageTo: 45 },
    "46-60": { ageFrom: 46, ageTo: 60 },
    "60+": { ageFrom: 60, ageTo: 100 },
  };
  
  const buildQueryParams = (selectedFiltersArray) => {
    const queryParams = new URLSearchParams();
  
    selectedFiltersArray.forEach((filter) => {
      if (filter["Filter name"] === "Marital Status") {
        filter.Options.forEach((option) =>
          queryParams.append("maritalStatus", option)
        );
      } else if (filter["Filter name"] === "Age") {
        const selectedOption = filter.Options[0];
        const selectedRange = ageRanges[selectedOption];
  
        if (selectedRange) {
          queryParams.append("ageFrom", selectedRange.ageFrom);
          queryParams.append("ageTo", selectedRange.ageTo);
        }
      }
    });
  
    return queryParams.toString();
  };
  
  const fetchMatrimonyData = async (queryString, selectedFiltersArray) => {
    const queryParams = buildQueryParams(selectedFiltersArray);
    const url = `/matrimony/matrimonyUsers?${queryString}&${queryParams}`;
    const response = await apiClient.get(url);
    return response.data.data;
  };
  
  const fetchVendorData = async (queryString) => {
    const url = `/matrimony/matrimonyVendor/matrimonyVendors?${queryString}`;
    const response = await apiClient.get(url);
    return response.data.data;
  };
  
  const fetchDecoratorData = async (queryString) => {
    const url = `/matrimony/decorator/decorators?${queryString}`;
    const response = await apiClient.get(url);
    return response.data.data;
  };
  
  const fetchCatererData = async (queryString) => {
    const url = `/matrimony/caterer/caterers?${queryString}`;
    const response = await apiClient.get(url);
    return response.data.data;
  };
  
  const fetchPlannerData = async (queryString) => {
    const url = `/matrimony/planner/planners?${queryString}`;
    const response = await apiClient.get(url);
    return response.data.data;
  };
  
  const fetchVenueData = async (queryString) => {
    const url = `/matrimony/venue/venues?${queryString}`;
    const response = await apiClient.get(url);
    return response.data.data;
  };
  
  const fetchConnectionRequests = async (userId) => {
    const response = await apiClient.get(`/matrimony/connection/requests/${userId}`);
    return response.data;
  };
  
  // Accept a connection request
  const acceptConnectionRequest = async (requestId) => {
    const response = await apiClient.post(`/matrimony/connection/accept-request/${requestId}`, {
      action: "accepted",
    });
    return response;
  };
  
  // Reject/delete a connection request
  const rejectConnectionRequest = async (requestId) => {
    const response = await apiClient.post(`/matrimony/connection/reject-request/${requestId}`, {
      action: "rejected",
    });
    return response;
  };
  const fetchMatrimonyUserProfile = async (userId) => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  };

  const updateMatrimonyUserProfile = async (userId, formData) => {
    const response = await apiClient.put(
      `/matrimony/matrimonyUser/edit/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  };

  const sendConnectionRequest = async ({ senderId, receiverId, createdBy }) => {
    const response = await apiClient.post(
      "/matrimony/connection/send-request",
      {
        senderId,
        receiverId,
        createdBy,
      }
    );
    return response;
  };

  const updateMatrimonyShopProfile = async (ownerRole, ownerId, formData) => {
    let editUrl = "";
    switch (ownerRole) {
      case "matrimonyVendor":
        editUrl = `/matrimony/matrimonyVendor/matrimonyVendors/edit/${ownerId}`;
        break;
      case "decorator":
        editUrl = `/matrimony/decorator/decorators/edit/${ownerId}`;
        break;
      case "caterer":
        editUrl = `/matrimony/caterer/caterers/edit/${ownerId}`;
        break;
      case "planner":
        editUrl = `/matrimony/planner/planners/edit/${ownerId}`;
        break;
      case "venue":
        editUrl = `/matrimony/venue/venues/edit/${ownerId}`;
        break;
      default:
        throw new Error("Invalid owner role");
    }
  
    const token = await getToken();
    const response = await apiClient.put(editUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  
    return response;
  };

  const connectToChat = async (owner_id, business_id, vendorId, navigation) => {
    if (owner_id === business_id) {
      alert("Chat room Cannot be created: same id");
      return;
    }
  
    try {
      const token = await getToken();
  
      const response = await apiClient.post(
        `/chat/room/`,
        { userIds: [owner_id, business_id] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        const roomResponse = await apiClient.get(`/chat/rooms/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (roomResponse.status === 200) {
          const roomData = roomResponse.data;
  
          if (roomData?.rooms?.length > 0) {
            const room_with_user = roomData.rooms.find(
              (room) => room.participants[0].id === vendorId
            );
  
            if (room_with_user) {
              Alert.alert("OK", "Chat Room Created", [
                {
                  text: "OK",
                  onPress: () => {
                    navigation.navigate("ChatScreenNew", {
                      user_auth_token: token,
                      room: room_with_user,
                      participant_name:
                        room_with_user.participants[0].firstName +
                        " " +
                        room_with_user.participants[0].lastName,
                    });
                  },
                },
              ]);
            } else {
              Alert.alert("No matching room found");
            }
          } else {
            Alert.alert("No rooms found");
          }
        } else {
          Alert.alert("Error Fetching Room Details");
        }
      } else {
        Alert.alert("Error Creating Chat Room");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("An unexpected error occurred");
    }
  };
  
  
  export {
    fetchMatrimonyData,
    fetchVendorData,
    fetchDecoratorData,
    fetchCatererData,
    fetchPlannerData,
    fetchVenueData,
    fetchConnectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    fetchMatrimonyUserProfile,
    updateMatrimonyUserProfile,
    sendConnectionRequest,
    updateMatrimonyShopProfile ,
    connectToChat,
  };

  

  