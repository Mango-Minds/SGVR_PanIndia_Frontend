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
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { BASEIMGURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import { BASEAPIURL } from "../../infrastructure/constants";
import { useSelector, useDispatch } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import HeaderBar from "../../components/Jewellery/HeaderBar";
import BottomTabBar from "../../components/Jewellery/BottomTabBar";
import { navigateJewelleryAuthTab } from "../../utils/requireAuth";
import { jewelleryColors, typography, spacing, commonStyles } from "../../styles/jewellery.styles";
import apiClient from "../../store/apiClient";
import moment from "moment";
import {
  JEWELLERY_NOTIFICATION_TYPES,
  useJewelleryNotificationLive,
  setJewelleryUnreadCount,
  fetchJewelleryUnreadCount,
} from "../../hooks/useJewelleryNotificationBadge";

function JewelleryNotifications({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { token, isGuest, user } = useSelector((state) => state.user);
  const [activeBottomTab, setActiveBottomTab] = useState("notifications");
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [stockNotifications, setStockNotifications] = useState([]);
  const [loadingStockNotifications, setLoadingStockNotifications] = useState(false);
  const [refreshingStockNotifications, setRefreshingStockNotifications] = useState(false);

  const tokenPayload = token?.split(".")?.[1];
  const decodedPayload = tokenPayload ? JSON.parse(decode(tokenPayload)) : null;
  console.log("user: ", user);
  const userId = user?.roleData?._id;
  const vendorId = user?.roleData?._id;
  const shopId = user?.roleData?._id;
  console.log("SId: ", shopId);
  const workerId = user?.roleData?._id;
  const designerId = user?.roleData?._id;
  const gemologistId = user?.roleData?._id;

  // Legacy jewellery connection-request APIs (/buy, vendorjewelrydesigneroperations,
  // vendorToVendor, shop, worker, gemologist) are unmounted on the backend.
  // Notifications load via /api/notifications/ only.
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

  const fetchStockNotifications = useCallback(async () => {
    try {
      setLoadingStockNotifications(true);
      const response = await apiClient.get("/notifications/");
      
      if (response.status === 200) {
        const allNotifications = response.data.notifications || [];
        // Only show unread jewellery notifications in the list
        const stockItemNotifications = allNotifications.filter(
          (notif) =>
            JEWELLERY_NOTIFICATION_TYPES.includes(notif.type) && !notif.read
        );
        setStockNotifications(stockItemNotifications);
        setJewelleryUnreadCount(stockItemNotifications.length);
      }
    } catch (error) {
      console.error("Error fetching stock notifications:", error);
    } finally {
      setLoadingStockNotifications(false);
      setLoadingAnimation(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStockNotifications();
    }, [fetchStockNotifications])
  );

  const handleLiveNotification = useCallback((data) => {
    if (!data || !JEWELLERY_NOTIFICATION_TYPES.includes(data.type)) return;
    if (data.read) return;

    setStockNotifications((prev) => {
      const incomingId = data._id ? String(data._id) : null;
      if (incomingId && prev.some((item) => String(item._id) === incomingId)) {
        return prev;
      }
      return [
        {
          ...data,
          read: false,
          createdAt: data.createdAt || new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, []);

  useJewelleryNotificationLive(handleLiveNotification);

  const handleRefreshStockNotifications = async () => {
    setRefreshingStockNotifications(true);
    await fetchStockNotifications();
    setRefreshingStockNotifications(false);
  };

  const unreadNotificationCount = stockNotifications.length;

  useEffect(() => {
    setJewelleryUnreadCount(unreadNotificationCount);
  }, [unreadNotificationCount]);

  const markNotificationAsRead = async (notificationId) => {
    // Remove from list immediately so it disappears after read
    setStockNotifications((prev) =>
      prev.filter((notif) => String(notif._id) !== String(notificationId))
    );

    try {
      await apiClient.patch(`/notifications/${notificationId}/markAsRead`);
      fetchJewelleryUnreadCount(token);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Refresh list if server mark-read failed
      fetchStockNotifications();
    }
  };

  const resolveEventId = (item) => {
    const raw = item?.eventId;
    if (!raw) return null;
    if (typeof raw === "string") return raw;
    if (typeof raw === "object") {
      return String(raw._id || raw.id || "");
    }
    return String(raw);
  };

  const handleNotificationPress = (item) => {
    if (!item) return;

    // Mark read + remove from list; navigate for event interest
    markNotificationAsRead(item._id);

    if (item.type !== "eventInterest") return;

    const eventId = resolveEventId(item);
    if (eventId && eventId !== "undefined" && eventId !== "null") {
      navigation.navigate("EventDetailScreen", { eventId });
      return;
    }

    // Fallback for older notifications without eventId: match by event name in message
    const match = item.message?.match(/interested in your event:\s*(.+)$/i);
    const eventName = match?.[1]?.trim();
    if (eventName) {
      (async () => {
        try {
          const response = await apiClient.get("/events/mine");
          const events = response.data?.data || response.data?.events || [];
          const found = events.find(
            (event) =>
              String(event.name || "").trim().toLowerCase() ===
              eventName.toLowerCase()
          );
          const foundId = found?._id || found?.id;
          if (foundId) {
            navigation.navigate("EventDetailScreen", {
              eventId: String(foundId),
            });
            return;
          }
        } catch (error) {
          console.error("Error resolving event from notification:", error);
        }
        Alert.alert(
          "Event",
          "Could not open this event. Please open it from Events."
        );
      })();
      return;
    }

    Alert.alert(
      "Event",
      "Could not open this event. Please open it from Events."
    );
  };

  const handleTabChange = (tab) => {
    setActiveBottomTab(tab);
    switch (tab) {
      case "home":
        navigation.navigate("HomeScreen");
        break;
      case "search":
        navigation.navigate("BrowseScreen");
        break;
      case "profile":
      case "message":
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      case "notifications":
        // Already on notifications
        break;
      default:
        break;
    }
  };

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
      return;
    }

    try {
      const conversationId = [owner_id, business_id].sort().join("_");
      navigation.navigate("ChatScreen", {
        toid: business_id,
        toName: "Chat",
        index: 0,
        conversationId,
      });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong while connecting to chat.");
    }
  };

  {console.log("notification: ", notification)}  

  // Check if there are any notifications to show
  const hasNotifications = 
    vendors.length > 0 ||
    vendorsData.length > 0 ||
    vendorDesignerData.length > 0 ||
    vendorGemologistData.length > 0 ||
    workersData.length > 0 ||
    designersData.length > 0 ||
    gemologistList.length > 0 ||
    vendorslistData.length > 0 ||
    shopsData.length > 0 ||
    shops.length > 0 ||
    vendorData.length > 0 ||
    stockNotifications.length > 0;

  const notificationsTitle =
    unreadNotificationCount > 0
      ? `Notifications (${unreadNotificationCount})`
      : "Notifications";

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={notificationsTitle} onBackPress={() => navigation.goBack()} />

      <View style={styles.contentWrapper}>
        {loadingAnimation || loadingStockNotifications ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={jewelleryColors.primary} />
          </View>
        ) : !hasNotifications ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.shadowProp}
            contentContainerStyle={[
              {
                backgroundColor: "#e6f9ff",
                padding: "2%",
                margin: "4%",
              },
              { paddingBottom: 80 + insets.bottom } // Account for tab bar height + safe area
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Render all connection requests */}
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

            {/* Render product buy requests */}
            {vendorData.map((vendor) => (
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
                    backgroundColor: "#ddd",
                    marginVertical: 10,
                  }}
                />
              </View>
            ))}

            {/* Render stock / event interest notifications */}
            {stockNotifications.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.notificationCard,
                  !item.read && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.8}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIcon}>
                    <Text style={styles.notificationIconText}>
                      {item.type === "stockItemCreated"
                        ? "📦"
                        : item.type === "stockItemUpdated"
                        ? "✏️"
                        : item.type === "eventInterest"
                        ? "❤️"
                        : item.type === "shopEventCreated"
                        ? "📅"
                        : "🔔"}
                    </Text>
                  </View>
                  <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>
                      {moment(item.createdAt).fromNow()}
                    </Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <BottomTabBar
        activeTab={activeBottomTab}
        onTabChange={handleTabChange}
        notificationCount={unreadNotificationCount}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: jewelleryColors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
  },
  notificationsList: {
    padding: spacing.md,
  },
  notificationCard: {
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...commonStyles.shadow,
  },
  notificationCardUnread: {
    borderWidth: 1,
    borderColor: jewelleryColors.primary + "40",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notificationIconText: {
    fontSize: 24,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationMessage: {
    ...typography.body,
    color: jewelleryColors.text,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    color: jewelleryColors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: jewelleryColors.primary,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  shadowProp: {
    backgroundColor: jewelleryColors.bgSecondary,
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
});

export default JewelleryNotifications;
