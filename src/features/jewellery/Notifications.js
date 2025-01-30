import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { IconButton } from "react-native-paper";
import { RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { BASEIMGURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import { BASEAPIURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/Jewellery/BottomNavigation";

function JewelleryNotifications({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("Requests");
  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useSelector((state) => state.user.user);
  console.log("user: ", user);
  const userId = user?.roleData?._id;
  const vendorId = user?.roleData?._id;
  const shopId = user?.roleData?._id;
  console.log("SId: ", shopId);
  const workerId = user?.roleData?._id;
  const designerId = user?.roleData?._id;
  const gemologistId = user?.roleData?._id;

  const userType = useSelector((state) => state.user.user.userType);
  useEffect(() => {
    if (userType === "vendor") {
      fetchShopToVendorRequest();
    }
  }, [userType, vendorId, token]);
  const [vendors, setVendors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [shopsData, setShopsData] = useState([]);
  const [vendorslistData, setVendorsListData] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [shops, setShops] = useState([]);
  const [vendorsData, setVendorsData] = useState([]);
  const [workersData, setWorkersData] = useState([]);
  const [designersData, setDesignersData] = useState([]);
  const [vendorDesignerData, setVendorDesignerData] = useState([]);
  const [gemologistList, setGemologistList] = useState([]);
  const [vendorGemologistData, setVendorGemologistData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [notification, setNotification] = useState("");
  console.log("Vendor id: ", vendorId);
  const vendorOwnerId = user?.roleData?.owner;
  console.log("Vendor owner id: ", vendorOwnerId);

  const removeAcceptedRequest = (requestId, setStateFunc) => {
    setStateFunc((prevRequests) =>
      prevRequests.filter((request) => request._id !== requestId)
    );
  };

  useEffect(() => {
    fetchVendorToVendorRequest();
    fetchVendorToShopRequest();
    fetchShopToShopRequest();
    fetchWorkerVendorRequest();
    fetchVendorWorkerRequest();
    fetchVendorDesignerRequest();
    fetchVendorGemologistRequest();
    fetchDesignerVendorRequest();
    fetchGemologistVendorRequest();
    fetchBuyRequest();
  }, []);

  const fetchVendorToVendorRequest = async () => {
    console.log("VToV vendor id: ", vendorId);
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorToVendorOperations/list-vendor-requests/${vendorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("v to v request", response);

      if (response.ok) {
        const data = await response.json();
        setVendors(data);

        console.log("VTOV Req data: ", data);
      } else {
        throw new Error("Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };
  const handleAcceptRequest = async (requestId, uId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorToVendorOperations/accept-vendor-to-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accept Successfully.");
        // fetchVendorToVendorRequest();
        setNotification(
          "The vendor has accepted your connection request! You can now buy any product from them."
        );
        
        // Log the notification immediately after setting it (It will not show the updated value immediately)
        console.log("Notification set:", "The vendor has accepted your connection request! You can now buy any product from them.");
        
        // Optionally, reset the notification after some time
        setTimeout(() => setNotification(""), 5000);
        removeAcceptedRequest(requestId, setVendors);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  useEffect(() => {
    if (notification) {
      console.log("Notification updated:", notification);
    }
  }, [notification]);  // This will run every time the notification state changes
  
  const handleDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorToVendorOperations/delete-vendor-to-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Deleted Successfully.");
        fetchVendorToVendorRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchShopToShopRequest = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/shopToShopOperations/list-shop-requests/${shopId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShops(data);
        console.log("STOS Req data: ", data);
      } else {
        throw new Error("Failed to fetch shop's request");
      }
    } catch (error) {
      console.error("Error fetching shop's request:", error);
    }
  };
  const handleSTOSAcceptRequest = async (requestId, uId) => {
    try {
      console.log("Request ID accept: ", requestId);
      console.log("STOS uid: ", uId);

      const response = await fetch(
        `${BASEAPIURL}/shopToShopOperations/accept-shop-to-shop-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accept Successfully.");
        // fetchShopToShopRequest();
        removeAcceptedRequest(requestId, setShops);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleSTOSDeleteRequest = async (requestId) => {
    try {
      console.log("Request ID del: ", requestId);

      const response = await fetch(
        `${BASEAPIURL}/shopToShopOperations/delete-shop-to-shop-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request deleted successfully.");
        fetchShopToShopRequest();
      } else {
        const responseText = await response.text();
        console.error(
          "Failed to delete request:",
          response.status,
          responseText
        );
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchVendorToShopRequest = async () => {
    try {
      console.log("VToS shop id: ", shopId);
      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/list-vendor-requests/${shopId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVendorsListData(data);
        console.log("VtoS Req data: ", data);
      } else {
        throw new Error("Failed to fetch VTOS request");
      }
    } catch (error) {
      console.error("Error fetching VTOS request:", error);
    }
  };
  const handleVTOSAcceptRequest = async (requestId, uId) => {
    try {
      if (!requestId) {
        console.error("No request ID selected");
        return;
      }
      console.log("VTOS Accept req Logs...");
      console.log(
        "Attempting to accept VTOS request with Request ID: ",
        requestId
      );
      console.log("User ID being used: ", uId);

      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/accept-shop-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accept Successfully.");
        // fetchVendorToShopRequest();
        removeAcceptedRequest(requestId, setVendorsListData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleVToSDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/delete-shop-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Deleted Successfully.");
        fetchVendorToShopRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchWorkerVendorRequest = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/list-vendor-requests/${workerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVendorsData(data);
        console.log("WtoV Req data: ", data);
      } else {
        throw new Error("Failed to list vendors req");
      }
    } catch (error) {
      console.error("Error fetching vendor's request:", error);
    }
  };
  const handleWToVAcceptRequest = async (requestId, uId) => {
    try {
      console.log("Vtow acept req logs..");
      console.log("Uid: ", uId);
      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/accept-worker-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accepted Successfully.");
        // fetchWorkerVendorRequest();
        removeAcceptedRequest(requestId, setVendorsData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleWToVDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/delete-worker-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Deleted Successfully.");
        fetchWorkerVendorRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchVendorWorkerRequest = async () => {
    try {
      console.log("Vendor id worker req in vendors: ", vendorId);
      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/list-worker-requests/${vendorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkersData(data);

        console.log("VToW Req: ", data);
      } else {
        throw new Error("Failed to fetch worker's request");
      }
    } catch (error) {
      console.error("Error fetching worker's request:", error);
    }
  };

  const handleVToWAcceptRequest = async (requestId, uId) => {
    try {
      console.log("Vtow acept req logs..");
      console.log("Uid: ", uId);

      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/accept-worker-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accepted Successfully.");
        // fetchVendorWorkerRequest();
        removeAcceptedRequest(requestId, setWorkersData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleVToWDeleteRequest = async (requestId) => {
    console.log("Starting delete request for vtow, Request ID: ", requestId);
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/delete-worker-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Error response: ", errorResponse);
        throw new Error(errorResponse.message || "Failed to delete request");
      }

      Alert.alert("Request Deleted Successfully.");
      fetchVendorWorkerRequest();
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert("Error", error.message);
    }
  };

  const fetchShopToVendorRequest = async () => {
    try {
      console.log("Fetching shop to vendor request for vendorId:", vendorId);

      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/list-shop-requests/${vendorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShopsData(data);
      } else {
        throw new Error("Failed to fetch SToV request");
      }
    } catch (error) {
      console.error("Error fetching SToV request:", error);
    }
  };
  const handleSToVAcceptRequest = async (requestId, uId) => {
    try {
      console.log("StoV reqid: ", requestId);
      console.log("StoV userid: ", uId);

      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/accept-shop-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accept Successfully.");
        // fetchShopToVendorRequest();
        removeAcceptedRequest(requestId, setShopsData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleSToVDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/delete-shop-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Deleted Successfully.");
        fetchShopToVendorRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchVendorDesignerRequest = async () => {
    try {
      console.log("Vendor id worker req in vendors: ", vendorId);
      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/list-jewelrydesigner-requests/${vendorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDesignersData(data);

        console.log("Designer to vendor Req: ", data);
      } else {
        throw new Error("Failed to fetch designer's request");
      }
    } catch (error) {
      console.error("Error fetching designer's request:", error);
    }
  };

  const handleDesignerAcceptRequest = async (requestId, uId) => {
    try {
      console.log("Designer to vendor accept req logs..");
      console.log("Uid: ", uId);

      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/accept-jewelrydesigner-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accepted Successfully.");
        removeAcceptedRequest(requestId, setDesignersData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleDesignerDeleteRequest = async (requestId) => {
    console.log(
      "Starting delete request for designertoVendor, Request ID: ",
      requestId
    );
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/delete-jewelrydesigner-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Error response: ", errorResponse);
        throw new Error(errorResponse.message || "Failed to delete request");
      }

      Alert.alert("Request Deleted Successfully.");
      fetchVendorDesignerRequest();
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert("Error", error.message);
    }
  };

  const fetchDesignerVendorRequest = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/list-vendor-requests/${designerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVendorDesignerData(data);
        console.log(
          "List requests created by vendor for jewelryDesigner: ",
          data
        );
      } else {
        throw new Error("Failed to list vendors req");
      }
    } catch (error) {
      console.error("Error fetching vendor's request:", error);
    }
  };
  const handleVtoDAcceptRequest = async (requestId, uId) => {
    try {
      console.log("VtoD acept req logs..");
      console.log("Uid: ", uId);
      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/accept-jewelrydesigner-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accepted Successfully.");

        removeAcceptedRequest(requestId, setVendorDesignerData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleVtoDDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/delete-jewelrydesigner-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Deleted Successfully.");
        fetchDesignerVendorRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchVendorGemologistRequest = async () => {
    try {
      console.log("Vendor id: ", vendorId);
      const response = await fetch(
        `${BASEAPIURL}/vendorGemologistOperations/list-gemologist-requests/${vendorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGemologistList(data);

        console.log("Gemologist to vendor Req: ", data);
      } else {
        throw new Error("Failed to fetch gemologist's request");
      }
    } catch (error) {
      console.error("Error fetching gemologist's request:", error);
    }
  };

  const handleGemologistAcceptRequest = async (requestId, uId) => {
    try {
      console.log("Gemologist to vendor accept req logs..");
      console.log("Uid: ", uId);

      const response = await fetch(
        `${BASEAPIURL}/vendorGemologistOperations/accept-gemologist-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accepted Successfully.");
        removeAcceptedRequest(requestId, setGemologistList);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleGemologistDeleteRequest = async (requestId) => {
    console.log(
      "Starting delete request for GemologisttoVendor, Request ID: ",
      requestId
    );
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorGemologistOperations/delete-gemologist-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Error response: ", errorResponse);
        throw new Error(errorResponse.message || "Failed to delete request");
      }

      Alert.alert("Request Deleted Successfully.");
      fetchVendorGemologistRequest();
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert("Error", error.message);
    }
  };

  const fetchGemologistVendorRequest = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorGemologistOperations/list-vendor-requests/${gemologistId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVendorGemologistData(data);
        console.log("List requests created by vendor for gemologist: ", data);
      } else {
        throw new Error("Failed to list vendors req");
      }
    } catch (error) {
      console.error("Error fetching vendor's request:", error);
    }
  };
  const handleVtoGAcceptRequest = async (requestId, uId) => {
    try {
      console.log("VtoG acept req logs..");
      console.log("Uid: ", uId);
      const response = await fetch(
        `${BASEAPIURL}/vendorGemologistOperations/accept-gemologist-vendor-request/${requestId}/${uId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Accepted Successfully.");

        removeAcceptedRequest(requestId, setVendorGemologistData);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  const handleVtoGDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorGemologistOperations/delete-gemologist-vendor-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Request Deleted Successfully.");
        fetchGemologistVendorRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const fetchBuyRequest = async () => {
    try {
      setLoadingAnimation(true);
      console.log("Vendor id: ", vendorId);
      const response = await fetch(
        `${BASEAPIURL}/buy/list-buy-requests/${vendorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoadingAnimation(false);
      if (response.ok) {
        const data = await response.json();
        setVendorData(data.requests);
        console.log("List requests created for buy products: ", data.requests);
      } else {
        throw new Error("Failed to list buy products req");
      }
    } catch (error) {
      console.error("Error fetching buy products's request:", error);
    }
  };

  console.log("Buy req data: ", vendorData);

  const handleBuyResponseRequest = async (action, requestId, vendor) => {
    try {
      console.log("Buy request id: ", requestId);
      const response = await fetch(
        `${BASEAPIURL}/buy/respond-buy-request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        Alert.alert(`Request ${action}ed Successfully.`);
        if (action === "accept") {
          const owner_id = vendor?.toVendorId?.owner?._id;
          const business_id = vendor?.fromId?.owner?._id;
          connectToChat(owner_id, business_id);
          console.log("Owner id: ", owner_id);
          console.log("Business Id: ", business_id);
        }
      } else {
        throw new Error("Failed to respond to request");
      }
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  const connectToChat = async (owner_id, business_id) => {
    console.log("Owner id: ", owner_id);
    console.log("Business id: ", business_id);
    if (owner_id === business_id) {
      console.log("Chat room Cannot be created: same id");
    } else {
      try {
        const response = await fetch(`${BASEAPIURL}/chat/room/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [owner_id, business_id] }),
        });
        console.log("Response: ", response);
        console.log("Authorization: ", `Bearer ${token}`);
        if (response.ok) {
          const roomResponse = await fetch(`${BASEAPIURL}/chat/rooms/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            console.log("Room Details: ", roomData);
            if (roomData && roomData.rooms && roomData.rooms.length > 0) {
              const room = roomData.rooms[0];
              console.log("Room: ", room);

              const room_with_user = roomData?.rooms.filter((room) => {
                console.log(
                  "room?.participants[0].id:",
                  room?.participants[0]?.id
                );
                console.log("vendorId:", business_id);
                return room?.participants[0]?.id === business_id;
              })[0];

              console.log("Room with user: ", room_with_user);
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
              Alert.alert("No rooms found");
            }
          } else {
            const errorData = await roomResponse.json();
            console.error("Error Fetching Room Details:", errorData);
            Alert.alert("Error Fetching Room Details");
          }
        } else {
          const errorData = await response.json();
          console.error("Error Creating Chat Room:", errorData);
          Alert.alert("Error Creating Chat Room");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  {console.log("notification: ", notification)}  

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          paddingHorizontal: 10,
        }}
      >
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Jewellery
            </TopText>
          </View>
        </RowBetween>
      </View>

      <View style={styles.tabsContainer}>
        {["Requests", "Product Requests"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={[styles.tab, selectedTab === tab ? styles.selectedTab : {}]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab ? styles.selectedTabText : {},
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View>
        {/* {selectedTab === "Requests" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 14,
              marginTop: 10,
            }}
          >
            <SearchField placeholder="Search" />
            <View style={{ position: "absolute", right: 20, elevation: 3 }}>
              <Icon name="search" size={24} />
            </View>
          </View>
        )} */}
      </View>

      {selectedTab === "Requests" && (
        <>
          <View
            style={[
              styles.shadowProp,
              {
                backgroundColor: "#e6f9ff",
                padding: "2%",
                margin: "4%",
                display: "flex",
                flexDirection: "row",
                flex: 1,
              },
            ]}
          >
            <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
              {vendors.map((vendor) => (
                <View key={vendor._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        source={
                          vendor.fromVendorImage
                            ? { uri: `${BASEIMGURL}${vendor.fromVendorImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {vendor.fromVendorUsername}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {vendor.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            // marginRight: 10,
                            left: 4,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = vendor.toVendorId;
                            handleAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            left: 10,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = vendor.vendorId;
                            handleDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {vendorsData.map((vendor) => (
                <View key={vendor._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        // source={{
                        //   uri: vendor.vendorImage,
                        // }}
                        source={
                          vendor.vendorImage
                            ? { uri: `${BASEIMGURL}${vendor.vendorImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {vendor.vendorUsername}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {vendor.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = vendor.vendorId;
                            handleWToVAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = vendor.vendorId;
                            handleWToVDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {vendorDesignerData.map((vendor) => (
                <View key={vendor._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        // source={{
                        //   uri: vendor.vendorImage,
                        // }}
                        source={
                          vendor.vendorImage
                            ? { uri: `${BASEIMGURL}${vendor.vendorImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {vendor.vendorUsername}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {vendor.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = vendor.vendorId;
                            handleVtoDAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = vendor.vendorId;
                            handleVtoDDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {vendorGemologistData.map((vendor) => (
                <View key={vendor._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        // source={{
                        //   uri: vendor.vendorImage,
                        // }}
                        source={
                          vendor.vendorImage
                            ? { uri: `${BASEIMGURL}${vendor.vendorImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {vendor.vendorUsername}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {vendor.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = vendor.vendorId;
                            handleVtoGAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);

                            handleVtoGDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {workersData.map((worker) => (
                <View key={worker._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        // source={{
                        //   uri: worker.workerImage,
                        // }}
                        source={
                          worker.workerImage
                            ? { uri: `${BASEIMGURL}${worker.workerImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {worker.workerName}
                        </Text>

                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {worker.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = worker._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = worker.workerId;
                            handleVToWAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = worker._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = worker.workerId;
                            handleVToWDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {designersData.map((designer) => (
                <View key={designer._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        source={
                          designer.profileImage
                            ? { uri: `${BASEIMGURL}${designer.profileImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {designer.username}
                        </Text>

                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {designer.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = designer._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = designer.vendorId;
                            handleDesignerAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = designer._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            handleDesignerDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {gemologistList.map((gemologist) => (
                <View key={gemologist._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        source={
                          gemologist.profileImage
                            ? {
                                uri: `${BASEIMGURL}${gemologist.profileImage}`,
                              }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {gemologist.username}
                        </Text>

                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {gemologist.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = gemologist._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = gemologist.vendorId;
                            handleGemologistAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = gemologist._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            handleGemologistDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {vendorslistData.map((vendor) => (
                <View key={vendor._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        source={
                          vendor.vendorImage
                            ? { uri: `${BASEIMGURL}${vendor.vendorImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {vendor.vendorUsername}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {vendor.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Request ID on press: ", requestId);
                            const uId = vendor.vendorId;
                            handleVTOSAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = vendor._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = vendor.vendorId;
                            handleVToSDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {shopsData.map((shopData) => (
                <View key={shopData._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        source={
                          shopData.shopImage
                            ? { uri: `${BASEIMGURL}${shopData.shopImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {shopData.shopName}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {shopData.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = shopData._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = shopData.shopId;
                            handleSToVAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = shopData._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = shopData.shopId;
                            handleSToVDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {shops.map((shop) => (
                <View key={shop._id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          opacity: 1,
                        }}
                        source={
                          shop.fromShopImage
                            ? { uri: `${BASEIMGURL}${shop.fromShopImage}` }
                            : UserImg
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {shop.fromShopName}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: 0,
                            opacity: 0.4,
                          }}
                        >
                          {shop.createdBy}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D4AF37",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            const requestId = shop._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            const uId = shop.toShopId;
                            handleSTOSAcceptRequest(requestId, uId);
                          }}
                        >
                          <Text style={{ color: "white" }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#CCCCCC",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            const requestId = shop._id;
                            setSelectedRequestId(requestId);
                            console.log("Req id: ", requestId);
                            // const uId = shop.toShopId;
                            handleSTOSDeleteRequest(requestId);
                          }}
                        >
                          <Text style={{ color: "black" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          <BottomNavigation navigation={navigation} />
        </>
      )}

      

      {selectedTab === "Product Requests" && (
        <>
          <View style={{ flex: 1 }}>
            {loadingAnimation === true ? (
              <ActivityIndicator
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                size={"large"}
                color={"#b98c13"}
              />
            ) : (
              <View
                style={[
                  styles.shadowProp,
                  {
                    backgroundColor: "#fefefe",
                    padding: "2%",
                    margin: "4%",
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                  },
                ]}
              >
                {vendorData.length === 0 ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, color: "grey" }}>
                      No data found
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    vertical={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {vendorData.map((vendor) => {
                      return (
                        <View key={vendor._id} style={{ marginBottom: 10 }}>
                          <TouchableOpacity>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                margin: 10,
                              }}
                            >
                              <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text
                                  style={{
                                    opacity: 0.7,
                                    fontSize: 15,
                                  }}
                                >
                                  {vendor?.fromType === "shop"
                                    ? vendor?.fromId?.shopName
                                    : vendor?.fromId?.username}{" "}
                                  has requested to buy {vendor?.productId?.name}
                                </Text>
                              </View>

                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: "#D4AF37",
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 5,
                                    marginRight: 10,
                                  }}
                                  onPress={() => {
                                    const requestId = vendor._id;
                                    console.log("Req id: ", requestId);
                                    setSelectedRequestId(requestId);
                                    handleBuyResponseRequest(
                                      "accept",
                                      requestId,
                                      vendor
                                    );
                                  }}
                                >
                                  <Text style={{ color: "white" }}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: "#CCCCCC",
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 5,
                                  }}
                                  onPress={() => {
                                    const requestId = vendor._id;
                                    console.log("Req id: ", requestId);
                                    setSelectedRequestId(requestId);
                                    handleBuyResponseRequest(
                                      "reject",
                                      requestId
                                    );
                                  }}
                                >
                                  <Text style={{ color: "black" }}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </TouchableOpacity>

                          {/* Divider line between each request */}
                          <View
                            style={{
                              height: 1,
                              backgroundColor: "#ddd", // Light grey color for the divider
                              marginVertical: 10,
                            }}
                          />
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          <BottomNavigation navigation={navigation} />
        </>
      )}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Catagory: {
    marginHorizontal: 10,
    marginVertical: 15,
  },
  CatagoryText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
    color: "#616161",
  },
  StockCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  stockImage: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  stockName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#141414",
    marginBottom: 10,
  },
  stockspecs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "73%",
  },
  stockdetails: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.5,
  },
  stocklocation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  stockloacaiontext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },

  shadowProp: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },

  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },

  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  circleImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 5,
    borderWidth: 0.1,
    borderColor: "gray",
  },
  chatIconBackground: {
    width: 60,
    height: 30,
    borderRadius: 22,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "lightgray",
    borderRadius: 10,
    width: 250,
    opacity: 1.5,
    height: 40,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 1,
    right: 8,
  },
});

export default JewelleryNotifications;
