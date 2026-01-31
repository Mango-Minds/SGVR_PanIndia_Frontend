import { React, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
} from "react-native";
import { ActivityIndicator, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import Theme from "../../styles/theme";
import Iconicons from "react-native-vector-icons/Ionicons";
import { RowBetween, SearchField } from "../../styles/common.styles";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import SelectDropdown from "react-native-select-dropdown";
import apiClient from "../../store/apiClient";
const statusOptions = [
  {
    title: "Accepted",
    value: "accepted",
    icon: "checkmark-circle",
    color: "#7AB163",
  }, // Green color
  {
    title: "Rejected",
    value: "rejected",
    icon: "close-circle",
    color: "#ff0000",
  }, // Red color
  {
    title: "Pending",
    value: "pending",
    icon: "time-outline",
    color: "#D4AF37",
  }, // Yellow-gold color
];
const TempleEvents = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const userId = decodedPayload.id;
  const isFocused = useIsFocused();
  const route = useRoute();
  const { date, onMarkedDatesUpdate } = route.params;
  const { templeId, panditId } = route.params;
  const { templeAdmin } = route.params;
  const { templePandits } = route.params;
  current_year = moment().year();
  const month = new Date(date).getMonth() + 1; 
  const year = new Date(date).getFullYear();
  const [selectedDate, setSelectedDate] = useState(date);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullRequirements, setShowFullRequirements] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All Events");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  // search with hide functionality.
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const toggleSearch = () => setIsSearchVisible(!isSearchVisible);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
  };
  const [events, setEvents] = useState([]);

  
  const [bookings, setBookings] = useState([]);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  // const deleteTempleEvent = async (eventId) => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/templeEvents/${eventId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("temple event deletion response", response);
  //     if (!response.ok) {
  //       throw new Error("Failed to delete temple event");
  //     } else {
  //       fetchTempleEvents();
  //     }
  //   } catch (error) {
  //     console.error("Error deleting temple event:", error);
  //   }
  // };

  const deleteTempleEvent = async (eventId) => {
    try {
      const response = await apiClient.delete(`/templeEvents/${eventId}`);
  
      if (response.status === 200) {
        fetchTempleEvents();
      } else {
        throw new Error("Failed to delete temple event");
      }
    } catch (error) {
      console.error("Error deleting temple event:", error);
    }
  };
  
  // const fetchTempleEvents = async () => {
  //   const url = `${BASEAPIURL}/templeEvents/temple/${templeId}?eventDate=${selectedDate}`;
    
  //   try {
  //     setLoadingAnimation(true);

  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("responseeee", response);
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Temple events data:", data);

  //       setEvents(data);
  //     } else {
  //       setEvents([]);
  //       throw new Error("Failed to fetch temple events");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching temple events", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  // const fetchMyBookings = async () => {
  //   const url = `${BASEAPIURL}/eventBooking/bookings?eventDate=${selectedDate}`;
  //   try {
  //     setLoadingAnimation(true);

  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("responseeee", response);
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Slot bookings data:", data);

  //       setBookings(data);
  //     } else {
  //       setBookings([]);
  //       throw new Error("Failed to fetch temple events");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching temple events", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const fetchTempleEvents = async () => {
    const url = `/templeEvents/temple/${templeId}?eventDate=${selectedDate}`;
  
    try {
      setLoadingAnimation(true);
  
      const response = await apiClient.get(url);
      setEvents(response.data);
    } catch (error) {
      // Handle 404 gracefully - it just means no events for this date
      if (error.response?.status === 404) {
        console.log("No events found for this date");
        setEvents([]);
      } else {
        console.warn("Error fetching temple events:", error.message);
        setEvents([]);
      }
    } finally {
      setLoadingAnimation(false);
    }
  };
  
  const fetchMyBookings = async () => {
    const url = `/eventBooking/bookings?eventDate=${selectedDate}`;
  
    try {
      setLoadingAnimation(true);
  
      const response = await apiClient.get(url);
      setBookings(response.data);
    } catch (error) {
      // Handle 404 gracefully - it just means no bookings for this date
      if (error.response?.status === 404) {
        console.log("No bookings found for this date");
        setBookings([]);
      } else {
        console.warn("Error fetching bookings:", error.message);
        setBookings([]);
      }
    } finally {
      setLoadingAnimation(false);
    }
  };
  
  
  useEffect(() => {
    if (isFocused && selectedTab === "All Events") {
      fetchTempleEvents();
    }
 
    if (isFocused && selectedTab === "My Bookings") {
      fetchMyBookings();
    }
  }, [isFocused, selectedDate, selectedTab]);




 
  //state variable for selected date

  //filter data based on date
  // const dateEventData = events.filter(
  //   (check) => check.eventDate === selectedDate
  // );

  //go to event create
  // const goToEventsCreate = () =>{
  //   navigation.navigate("TempleEventsCreate");
  // }

  //Header for Dates
  const changeDateStructure = (date) => {
    console.log("inside changeee ");
    const formattedDate_crude = moment(
      `${date} ${current_year}`,
      "DD MMM YYYY"
    );
    const formattedDate = formattedDate_crude.format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
  };



  const [modalVisible, setModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [chatPanditId, setChatPanditId] = useState();

  const toggleSlotSelection = (slot) => {
    if (selectedSlot === slot) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  // const confirmStatusChange = async (newStatus, bookingId) => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/eventBooking/${bookingId}/handle`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           action: newStatus.toLowerCase(),
  //         }),
  //       }
  //     );
  //     console.log(response);

  //     if (!response.ok) {
  //       throw new Error("Failed to update booking status");
  //     }
  //     fetchMyBookings();
  //   } catch (error) {
  //     console.error("Failed to update booking status:", error);
  //   }
  // };

  // const sendRequest = async (eventId) => {
  //   if (!selectedSlot) {
  //     Alert.alert("Error", "Please select a slot before sending a request.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/eventBooking/${eventId}/book`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ slotId: selectedSlot.slotId }),
  //       }
  //     );

  //     if (response.ok) {
  //       Alert.alert("Success", "Your request has been sent to the Pandit.");
  //       fetchTempleEvents();
  //     } else {
  //       Alert.alert(
  //         "Error",
  //         "There was an error sending your request. Please try again."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error sending request:", error);
  //     Alert.alert("Error", "An error occurred. Please try again.");
  //   } finally {
  //     setModalVisible(false); // Close the modal
  //     setSelectedSlot(null); // Clear the selected slot
  //   }
  // };

  const confirmStatusChange = async (newStatus, bookingId) => {
    try {
      const response = await apiClient.post(`/eventBooking/${bookingId}/handle`, {
        action: newStatus.toLowerCase(),
      });
  
      if (response.status === 200) {
        fetchMyBookings();
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };
  
  const sendRequest = async (eventId) => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a slot before sending a request.");
      return;
    }
  
    try {
      const response = await apiClient.post(`/eventBooking/${eventId}/book`, {
        slotId: selectedSlot.slotId,
      });
  
      if (response.status === 200) {
        Alert.alert("Success", "Your request has been sent to the Pandit.");
        fetchTempleEvents();
      } else {
        Alert.alert("Error", "There was an error sending your request. Please try again.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setModalVisible(false); // Close the modal
      setSelectedSlot(null); // Clear the selected slot
    }
  };
  const DateList = () => {
    const generateDatesForMonth = (selectedDate) => {
      const dates = [];
      const startDate = moment(); // Start from today
      const endDate = moment(selectedDate).endOf("month"); // Get the end of the month

      const numDays = endDate.diff(startDate, "days") + 1; // Calculate the number of days remaining in the month

      for (let i = 0; i < numDays; i++) {
        dates.push(
          startDate.clone().add(i, "days").format("DD MMM").toUpperCase()
        );
      }

      return dates;
    };

    const dates = generateDatesForMonth(selectedDate);

    // Function to check if a date has events
    // const hasEvent = (date) => {
    //   const formattedDate_crude = moment(
    //     `${date} ${current_year}`,
    //     "DD MMM YYYY"
    //   );
    //   const formattedDate = formattedDate_crude.format("YYYY-MM-DD");
    //   return templeEvents.some((event) => event.event_date === formattedDate);
    // };

    // Convert '18 JUN' to '2024-06-18' for state variable

    return (
      <View style={styles.dateContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates &&
            dates.map((date, index) => {
              // const eventExists = hasEvent(date);
              const isDateSame =
                moment(`${date} ${current_year}`, "DD MMM YYYY").format(
                  "YYYY-MM-DD"
                ) === selectedDate;
              return (
                <TouchableOpacity
                  key={index}
                  style={
                    isDateSame ? styles.dateSelected : styles.dateWithoutEvent
                  }
                  activeOpacity={isDateSame ? 0.6 : 1}
                  // disabled={!eventExists}
                  onPress={() => changeDateStructure(date)}
                >
                  <Text
                    style={
                      isDateSame
                        ? styles.dateTextWithEvent
                        : styles.dateTextWithoutEvent
                    }
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>
    );
  };

  // const createChatRoom = async (userId) => {
  //   console.log("userId: ", userId);
  //   console.log("panditId: ", templePandits[0].owner);

  //   try {
  //     const response = await fetch(`${BASEAPIURL}/chat/room/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ userIds: [userId, templePandits[0].owner] }),
  //     });

  //     console.log("Response: ", response);
  //     console.log("Authorization: ", `Bearer ${token}`);

  //     if (response.ok) {
  //       const roomResponse = await fetch(`${BASEAPIURL}/chat/rooms/`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (roomResponse.ok) {
  //         const roomData = await roomResponse.json();
  //         console.log("Room Details: ", roomData);

  //         if (roomData && roomData.rooms && roomData.rooms.length > 0) {
  //           const room = roomData.rooms[0];
  //           Alert.alert("OK", "Chat Room Created", [
  //             {
  //               text: "OK",
  //               onPress: () => {
  //                 navigation.navigate("ChatScreenNew", {
  //                   user_auth_token: token,
  //                   room: room,
  //                 });
  //               },
  //             },
  //           ]);
  //         } else {
  //           Alert.alert("No rooms found");
  //         }
  //       } else {
  //         const errorData = await roomResponse.json();
  //         console.error("Error Fetching Room Details:", errorData);
  //         Alert.alert("Error Fetching Room Details");
  //       }
  //     } else {
  //       const errorData = await response.json();
  //       console.error("Error Creating Chat Room:", errorData);
  //       Alert.alert("Error Creating Chat Room");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const isVisible = 
  decodedPayload.userType === 'SA' || 
  userId === templeAdmin || 
  templePandits.some(pandit => pandit.owner === userId);

  // const createChatRoom = async (userId) => {
  //   console.log("userId: ", userId);
  //   console.log("panditId: ", chatPanditId);

  //   try {
  //     const response = await fetch(`${BASEAPIURL}/chat/room/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ userIds: [userId, chatPanditId] }),
  //     });

  //     console.log("Response: ", response);
  //     console.log(response.json());

  //     if (response.ok) {
  //       try {
  //         const roomResponse = await fetch(`${BASEAPIURL}/chat/rooms/`, {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });
  //         if (roomResponse.ok) {
  //           const roomData = await roomResponse.json();
  //           // setUserRooms(data);
  //           console.log("Room Data: ", roomData);
  //           const room_with_pandit = roomData.rooms.filter((room) => room.participants[0].id === chatPanditId)[0];
  //           console.log("Room with pandit",room_with_pandit);
  //           setRequestModalVisible(false);
  //           navigation.navigate("ChatScreenNew", {
  //             user_auth_token: token,
  //             room: room_with_pandit,
  //             participant_name:
  //             room_with_user.pandit[0].firstName +
  //             " " +
  //             room_with_user.pandit[0].lastName,
  //           });
  //         } else {
  //           Alert.alert("Failed to fetch Room.");
  //           throw new Error("Failed to fetch rooms");
            
  //         }
  //       } catch (error) {
  //         console.error("Error fetching room:", error);
  //       }
  //     } else {
  //       const errorData = await response.json();
  //       console.error("Error Creating Chat Room:", errorData);
  //       Alert.alert("Error Creating Chat Room");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const createChatRoom = async (userId) => {
    console.log("userId: ", userId);
    console.log("panditId: ", chatPanditId);
  
    try {
      // Create Chat Room
      const response = await apiClient.post("/chat/room/", {
        userIds: [userId, chatPanditId],
      });
  
      console.log("Response: ", response.data);
  
      // Fetch Chat Rooms
      const roomResponse = await apiClient.get("/chat/rooms/");
      console.log("Room Response: ", roomResponse.data);
  
      if (roomResponse.data) {
        const roomWithPandit = roomResponse.data.rooms.find(
          (room) => room.participants[0].id === chatPanditId
        );
  
        console.log("Room with pandit", roomWithPandit);
  
        setRequestModalVisible(false);
        navigation.navigate("ChatScreenNew", {
          user_auth_token: token,
          room: roomWithPandit,
          participant_name: `${roomWithPandit.pandit[0].firstName} ${roomWithPandit.pandit[0].lastName}`,
        });
      } else {
        Alert.alert("Failed to fetch Room.");
        throw new Error("Failed to fetch rooms");
      }
    } catch (error) {
      console.error("Error Creating Chat Room:", error);
      Alert.alert("Error Creating Chat Room");
    }
  };
  return (
    <ScrollView style={styles.container}>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("TempleEventsCreate", {
                templeAdmin: templeAdmin,
                templeId: templeId,
                templePandits: templePandits,
              })
            }
          >
            {isVisible && (
            <IconButton icon="plus"></IconButton>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleSearch}>
            <Iconicons
              name="search"
              size={24}
              style={{ marginRight: 15, color: "grey" }}
            />
          </TouchableOpacity>

          {/* Filter button commented out for all roles */}
          {/* <TouchableOpacity>
            <Iconicons name="filter" size={24} color="black" />
          </TouchableOpacity> */}

          {/* <IconButton
              icon="bell-outline"
              style={{ marginLeft: "auto" }}
            ></IconButton> */}
        </View>
      </RowBetween>
      {isSearchVisible && (
        <View
          style={{
            alignItems: "center",
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 10,
          }}
        >
          <SearchField placeholder="Search" onChangeText={handleSearch} />
        </View>
      )}
      <DateList />
      <View style={styles.tabsContainer}>
        {["All Events", "My Bookings"].map((tab) => (
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
      {selectedTab === "All Events" &&
        (loadingAnimation === true ? (
          <ActivityIndicator
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            size={"large"}
            color={Theme.themeColor}
          />
        ) : (
          <>
            {events.length === 0 ? (
              <View style={styles.noEventView}>
                <Text style={styles.noEventText}>No events on This Day</Text>
              </View>
            ) : (
              <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.eventsContainer}>
                    <View style={styles.eventsHeader}>
                      <Text style={styles.eventsName}>{item.eventName}</Text>
                      <View style={styles.iconAndDurationContainer}>
                        {(item.createdBy == userId ||
                          userId == templeAdmin ||
                          decodedPayload.userType.includes("SA")) && (
                          <>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("TempleEventEdit", {
                                  event: item,
                                  templePandits: templePandits,
                                })
                              }
                            >
                              <Iconicons
                                name="pencil"
                                size={20}
                                color="grey"
                                style={{ marginRight: 10 }}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => deleteTempleEvent(item._id)}
                            >
                              <Iconicons
                                name="trash"
                                size={20}
                                color="grey"
                                style={{ marginRight: 10 }}
                              />
                            </TouchableOpacity>
                          </>
                        )}
                        <Iconicons name="timer" size={22} color={Theme.themeColor} />
                        <Text style={{ color: "black", marginLeft: 4 }}>
                          {item.eventDuration} Minutes
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text style={{ marginBottom: 2 }}>
                        {showFullDescription
                          ? item.eventDescription
                          : `${item.eventDescription.substring(0, 100)}...`}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                      >
                        <Text style={styles.showMoreButton}>
                          {showFullDescription
                            ? "Show Less..."
                            : "Show More..."}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {item.eventType === "puja" && (
                      <>
                        <Text style={styles.requirementsHeader}>
                          Pooja Requirements:
                        </Text>
                        {showFullRequirements ? (
                          <>
                            {item.eventRequirements.map(
                              (requirement, index) => (
                                <Text
                                  key={index}
                                  style={styles.requirementItem}
                                >
                                  {requirement}
                                </Text>
                              )
                            )}
                            <TouchableOpacity
                              onPress={() => setShowFullRequirements(false)}
                            >
                              <Text style={styles.showMoreButton}>
                                Show Less...
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            {item.eventRequirements
                              .slice(0, 3)
                              .map((requirement, index) => (
                                <Text
                                  key={index}
                                  style={styles.requirementItem}
                                >
                                  {requirement}
                                </Text>
                              ))}
                            {item.eventRequirements.length > 3 && (
                              <TouchableOpacity
                                onPress={() => setShowFullRequirements(true)}
                              >
                                <Text style={styles.showMoreButton}>
                                  Show More...
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                        <Text style={styles.requirementsHeader}>
                          Pooja Pandit:
                        </Text>
                        <Text style={styles.panditText}>
                          {item.pandits && item.pandits.panditName}
                        </Text>
                        <Text style={styles.requirementsHeader}>
                          Pooja Instructions:
                        </Text>
                        <Text style={styles.practiceText}>
                          {item.instructions}
                        </Text>
                      </>
                    )}

                    <Text style={styles.requirementsHeader}>
                      {item.eventType === "puja"
                        ? "Available Slots:"
                        : "Event Timings:"}
                    </Text>
                    {item.eventType === "normal" && (
                      <View style={styles.timeContainer}>
                        {item.eventTime &&
                          item.eventTime.map((time, index) => (
                            <View key={index} style={styles.timeLayout}>
                              <Text style={styles.timeText}>{time}</Text>
                            </View>
                          ))}
                      </View>
                    )}
                    {item.eventType === "puja" && (
                      <View style={styles.timeContainer}>
                        {item.availableSlots &&
                          item.availableSlots.map((slot, index) => (
                            <View key={index} style={styles.timeLayout}>
                              <Text
                                style={[
                                  styles.timeText,
                                  slot.isBooked === "available"
                                    ? styles.available
                                    : slot.isBooked === "requested"
                                    ? styles.requested
                                    : styles.booked,
                                ]}
                              >
                                {slot.startTime} - {slot.endTime}
                              </Text>
                            </View>
                          ))}
                      </View>
                    )}

                    {item.eventType === "puja" 
                       && user.userType.includes("basicUser") &&
                     ( <View>
                        <TouchableOpacity
                          onPress={() => {
                            setCurrentEvent(item);
                            setModalVisible(true);
                          }}
                          style={styles.bookButton}
                        >
                          <Text style={styles.bookButtonText}>Book Slots</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setChatPanditId(item.pandits.owner);
                            setRequestModalVisible(true);
                          }}
                          style={styles.bookButton}
                        >
                          <Text style={styles.bookButtonText}>
                            Chat With Pandit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              />
            )}

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Slots</Text>
                  <ScrollView style={styles.slotsContainer}>
                    {currentEvent?.availableSlots
                      .filter((slot) => slot.isBooked === "available") // Filter to include only available slots
                      .map((time, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.slotItem,
                            selectedSlot === time && styles.selectedSlotItem,
                          ]}
                          onPress={() => toggleSlotSelection(time)}
                        >
                          <Text style={styles.slotText}>
                            {time.startTime} - {time.endTime}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.sendRequestButton}
                    onPress={() => sendRequest(currentEvent._id)}
                  >
                    <Text style={styles.sendRequestButtonText}>
                      Send Request
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={requestModalVisible}
              onRequestClose={() => setRequestModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Are you sure you want to chat with Pandit?
                  </Text>
                  <TouchableOpacity
                    style={styles.sendRequestButton}
                    onPress={() => {
                      createChatRoom(userId);
                      console.log(templePandits);
                    }}
                  >
                    <Text style={styles.sendRequestButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setRequestModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        ))}
      {selectedTab === "My Bookings" && (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventsContainer}>
              <View style={styles.eventsHeader}>
                <Text style={styles.eventsName}>
                  {item.templeEvent.eventName}
                </Text>
                <View style={styles.iconAndDurationContainer}>
                  <Iconicons name="timer" size={22} color={Theme.themeColor} />
                  <Text style={{ color: "black", marginLeft: 4 }}>
                    {item.templeEvent.eventDuration} Minutes
                  </Text>
                </View>
              </View>
              <View>
                <Text style={{ marginBottom: 2 }}>
                  {showFullDescription
                    ? item.templeEvent.eventDescription
                    : `${item.templeEvent.eventDescription.substring(
                        0,
                        100
                      )}...`}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFullDescription(!showFullDescription)}
                >
                  <Text style={styles.showMoreButton}>
                    {showFullDescription ? "Show Less..." : "Show More..."}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* {item.eventType === "puja" && (
                <>
                  <Text style={styles.requirementsHeader}>Pooja Pandit:</Text>
                  <Text style={styles.panditText}>
                    {item.pandits && item.pandits.panditName}
                  </Text>
                </>
              )} */}

              <Text style={styles.requirementsHeader}>Booked By:</Text>
              <Text style={styles.panditText}>
                {item.user && item.user.firstName}{" "}
                {item.user && item.user.lastName}
              </Text>

              <Text style={styles.requirementsHeader}>Slot Timing</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeLayout}>
                  <Text style={styles.timeText}>
                    {" "}
                    {item.slotTiming.startTime} - {item.slotTiming.endTime}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                  marginVertical: 10,
                }}
              >
                <Text style={styles.statusLabel}>Booking Status:</Text>
                {item.templeEvent.createdBy == userId ? (
                  <SelectDropdown
                    data={statusOptions}
                    onSelect={(selectedItem) => {
                      confirmStatusChange(selectedItem.value, item._id);
                    }}
                    defaultValueByIndex={statusOptions.findIndex(
                      (option) =>
                        option.title.toLowerCase() === item.status.toLowerCase()
                    )}
                    renderDropdownIcon={(isOpened) => (
                      <Icon
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#000"
                      />
                    )}
                    buttonTextAfterSelection={(selectedItem) =>
                      selectedItem.title
                    }
                    rowTextForSelection={(item) => item.title}
                    buttonStyle={{
                      width: 105,
                      height: 40,
                      backgroundColor: "#E9ECEF",
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      margin: 0,
                      marginBottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    buttonTextStyle={{
                      fontSize: 14,
                      color: "#000",
                      textAlign: "center",
                      paddingHorizontal: 0,
                    }}
                    dropdownStyle={{
                      borderRadius: 8,
                      marginTop: -20,
                    }}
                    rowStyle={{
                      height: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#E9ECEF",
                      paddingHorizontal: 4,
                    }}
                    rowTextStyle={{
                      fontSize: 14,
                      color: "#000",
                      textAlign: "center",
                      paddingHorizontal: 0,
                    }}
                    renderCustomizedRowChild={(item) => (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          color={item.color}
                          style={{ marginRight: 5 }}
                        />
                        <Text>{item.title}</Text>
                      </View>
                    )}
                    renderCustomizedButtonChild={(selectedItem) => (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon
                          name={
                            selectedItem ? selectedItem.icon : "time-outline"
                          }
                          size={16}
                          color={selectedItem ? selectedItem.color : "#D4AF37"}
                          style={{ marginRight: 5 }}
                        />
                        <Text>
                          {selectedItem ? selectedItem.title : "Pending"}
                        </Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.statusText}>Pending</Text>
                )}
              </View>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

export default TempleEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    alignItems: "center",
    marginVertical: 10,
  },
  time: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  date: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    backgroundColor: "white",
  },
  dateSelected: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: Theme.themeColor,
  },
  dateText: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  priceButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  priceText: {
    fontSize: 12,
  },
  eventsContainer: {
    backgroundColor: "#fff",
    padding: 10,

    borderRadius: 10,
    marginBottom: 20,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventsName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },

  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  timeText: {
    fontSize: 14,
    color: "green",
  },
  audioText: {
    fontSize: 12,
    color: "gray",
  },
  dateWithEvent: {
    padding: 10,
    backgroundColor: "green",
    borderRadius: 5,
    marginHorizontal: 5,
    opacity: 1,
  },
  dateWithoutEvent: {
    padding: 10,
    backgroundColor: "lightgray",
    borderRadius: 5,
    marginHorizontal: 5,
    opacity: 0.4,
  },
  dateTextWithEvent: {
    color: "white",
  },
  dateTextWithoutEvent: {
    color: "#000",
  },
  ifDateSelected: {
    backgroundColor: Theme.themeColor,
  },
  ifDateNotSelected: {
    backgroundColor: "lightgray",
  },
  noEventView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Align items horizontally
  },
  noEventText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    textAlign: "center", // Center the text
  },
  timeLayout: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
    margin: 5,
  },
  iconAndDurationContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  editDeleteContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  editLayout: {
    backgroundColor: "#D4AF37",
    padding: 8,
    borderRadius: 5,
    margin: 5,
    width: 60,
  },
  deleteLayout: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    margin: 5,
    width: 60,
  },
  requirementsHeader: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  requirementItem: {
    marginBottom: 3,
    color: "black",
  },
  panditText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#6c757d", // Dark grey color for emphasis
    fontWeight: "bold",
  },
  practiceText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#495057", // Darker grey color for emphasis
  },
  showMoreButton: {
    color: "grey",
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: "auto",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  slotsContainer: {
    width: "100%",
    maxHeight: 250,
  },
  slotItem: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
  },
  selectedSlotItem: {
    backgroundColor: Theme.themeColor,
  },
  slotText: {
    fontSize: 16,
  },
  sendRequestButton: {
    marginTop: 20,
    backgroundColor: Theme.themeColor,
    padding: 10,
    borderRadius: 5,
  },
  sendRequestButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: Theme.themeColor,
    fontWeight: "bold",
  },
  bookButton: {
    marginTop: 10,
    backgroundColor: Theme.themeColor,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
  },

  available: {
    color: "green",
  },
  requested: {
    color: "grey",
  },
  booked: {
    color: "red",
  },
});

