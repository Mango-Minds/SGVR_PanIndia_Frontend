import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar } from "react-native-calendars";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Theme from "../../styles/theme";
import { Button, IconButton, Provider } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  LoginInputAreaField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base-64";
import { useRoute } from "@react-navigation/native";

import apiClient from "../../store/apiClient";
const TempleEventsCreate = ({ navigation }) => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const route = useRoute();
  const { date } = route.params;
  const { templeAdmin } = route.params;
  const { templeId } = route.params;
  const { templePandits } = route.params;

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDuration, setEventDuration] = useState();
  const [selectedDate, setSelectedDate] = useState(date ? moment(date).toDate() : new Date());
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [show, setShow] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const { loadingInBtn } = useSelector((state) => state.user);

  const [poojaMaterials, setPoojaMaterials] = useState([]);
  const [poojaPandit, setPoojaPandit] = useState("");
  const [poojaPractices, setPoojaPractices] = useState("");

  // New state for user type detection and pandit info
  const [currentUserPandit, setCurrentUserPandit] = useState(null);
  const [isCurrentUserPandit, setIsCurrentUserPandit] = useState(false);
  const [isCurrentUserTempleAdmin, setIsCurrentUserTempleAdmin] = useState(false);
  const [availablePandits, setAvailablePandits] = useState([]);

  // Keyboard handling state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [availability, setAvailability] = useState([["", ""]]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isStartTime, setIsStartTime] = useState(true);

  // Determine user type and fetch pandit information
  useEffect(() => {
    const initializeUserInfo = async () => {
      try {
        if (!token) return;

        // Decode JWT token to get user information
        const tokenPayload = token.split(".")[1];
        const decodedPayload = JSON.parse(decode(tokenPayload));
        const userId = decodedPayload.id;
        const userType = decodedPayload.userType;

        // Check if current user is a pandit
        const isPandit = Array.isArray(userType) && userType.includes('pandit');
        setIsCurrentUserPandit(isPandit);

        // Check if current user is temple admin (created this temple)
        const isAdmin = templeAdmin === userId;
        setIsCurrentUserTempleAdmin(isAdmin);

        if (isPandit) {
          // Fetch current user's pandit information from user endpoint
          const response = await apiClient.get(`/user/${userId}`);
          if (response.status === 200 && response.data.user && response.data.user.roleData && response.data.user.roleData.pandit) {
            const panditInfo = response.data.user.roleData.pandit;
            setCurrentUserPandit(panditInfo);
            
            // For pandits, show only themselves in the dropdown for puja events
            setAvailablePandits([panditInfo]);
            
            // Pre-select the current pandit
            setPoojaPandit(panditInfo._id);
          }
        } else {
          // For temple admins and other users, show all temple pandits
          setAvailablePandits(templePandits || []);
        }
      } catch (error) {
        console.warn("Error initializing user info:", error.message);
        // Fallback to showing all temple pandits
        setAvailablePandits(templePandits || []);
      }
    };

    initializeUserInfo();
  }, [token, templeAdmin, templePandits]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const addSlot = () => setAvailability([...availability, ["", ""]]);

  const updateSlot = (index, value, isStart) => {
    const updatedSlots = availability.map((slot, i) =>
      i === index ? (isStart ? [value, slot[1]] : [slot[0], value]) : slot
    );
    setAvailability(updatedSlots);
  };

  const removeSlot = (index) =>
    setAvailability(availability.filter((_, i) => i !== index));

  const onSlotTimeChange = (event, selectedTime) => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    if (selectedTime) {
      updateSlot(selectedSlotIndex, selectedTime, isStartTime);
    }
  };

  const openSlotTimePicker = (index, isStart) => {
    setSelectedSlotIndex(index);
    setIsStartTime(isStart);
    if (isStart) {
      setShowStartPicker(true);
    } else {
      setShowEndPicker(true);
    }
  };

  const addPoojaMaterial = () => {
    setPoojaMaterials([...poojaMaterials, ""]);
  };

  const removePoojaMaterial = (index) => {
    setPoojaMaterials(poojaMaterials.filter((_, i) => i !== index));
  };

  const updatePoojaMaterial = (text, index) => {
    const updatedMaterials = [...poojaMaterials];
    updatedMaterials[index] = text;
    setPoojaMaterials(updatedMaterials);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event.type === "set") {
      if (selectedTime) {
        setTimes((prevTimes) => [...prevTimes, selectedTime]);
      }
    }
  };

  const removeTime = (index) => {
    setTimes((prevTimes) => prevTimes.filter((_, i) => i !== index));
  };

  const formatTime = (time) => {
    if (time == null || time == "" || time == "") return;
    let hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const strTime = `${hours}:${minutes}`;
    return strTime;
  };

  const openCalendar = () => {
    setShowCalendarModal(true);
  };

  const onChange = (event, date) => {
    setShow(false);
    if (event.type === "set" && date) {
      setSelectedDate(date);
    }
  };
  
  const onDayPress = (day) => {
    setSelectedDate(moment(day.dateString).toDate());
    setShowCalendarModal(false);
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";
    return moment(date).format("DD/MM/YYYY");
  };

  const formatDisplayTime = (time) => {
    if (!time) return "";
    return moment(time).format("HH:mm");
  };

  // Validation functions
  const validateDate = () => {
    if (!selectedDate) {
      Alert.alert("Validation Error", "Please select an event date");
      return false;
    }
    if (moment(selectedDate).isBefore(moment(), 'day')) {
      Alert.alert("Validation Error", "Event date cannot be in the past");
      return false;
    }
    return true;
  };

  const validateTimes = () => {
    if (eventType === "normal" && times.length === 0) {
      Alert.alert("Validation Error", "Please add at least one event time");
      return false;
    }
    return true;
  };

  const validateAvailability = () => {
    if (eventType === "puja") {
      const hasIncompleteSlots = availability.some(slot => !slot[0] || !slot[1]);
      if (hasIncompleteSlots) {
        Alert.alert("Validation Error", "Please complete all time slots or remove incomplete ones");
        return false;
      }
      
      // Check for overlapping slots
      const sortedSlots = availability
        .filter(slot => slot[0] && slot[1])
        .map(slot => ({
          start: moment(slot[0]),
          end: moment(slot[1])
        }))
        .sort((a, b) => a.start.diff(b.start));

      for (let i = 0; i < sortedSlots.length - 1; i++) {
        if (sortedSlots[i].end.isAfter(sortedSlots[i + 1].start)) {
          Alert.alert("Validation Error", "Time slots cannot overlap");
          return false;
        }
      }

      // Check if start time is before end time for each slot
      for (let slot of availability) {
        if (slot[0] && slot[1] && moment(slot[0]).isAfter(moment(slot[1]))) {
          Alert.alert("Validation Error", "Start time must be before end time");
          return false;
        }
      }
    }
    return true;
  };

  // const handleSubmit = async () => {
  //   try {
  //     if (!token) {
  //       console.error("Bearer token not found");
  //       return;
  //     }
  //     dispatch(setLoadingInBtn(true));

  //     // const eventDate = selectedDate.toISOString().split("T")[0];
  //     const eventDate = selectedDate
  // ? `${selectedDate.getDate().toString().padStart(2, "0")}/${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}/${selectedDate.getFullYear()}`
  // : "";

  //     const eventTime = times.map((time) => formatTime(time));
  //     // const formattedAvailability = availability.map((slot) =>
  //     //   slot.map((time) => formatTime(time))
  //     // );
  //     const formattedAvailability = availability.map((slot) => ({
  //       startTime: formatTime(slot[0]),
  //       endTime: formatTime(slot[1]),
        
  //     }));
      
  //     // Construct the base event data object
  //     let eventData = {
  //       eventName,
  //       eventDate,
  //       eventDescription,
  //       temple: templeId,
  //       eventType,
  //       eventDuration: parseInt(eventDuration),
  //     };

  //     // Conditionally add fields if the event is a "Pooja Event"
  //     if (eventType === "normal") {
  //       eventData = {
  //         ...eventData,
  //         eventTime,
  //       };
  //     }

  //     if (eventType === "puja") {
  //       eventData = {
  //         ...eventData,
  //         eventRequirements: poojaMaterials,
  //         availableSlots: formattedAvailability,
  //         instructions: poojaPractices,
  //         pandits: poojaPandit,
  //       };
  //     }
  //     console.log("sent event data", eventData);

  //     const response = await fetch(`${BASEAPIURL}/templeEvents`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(eventData),
  //     });
  //     console.log("response", response);

  //     dispatch(setLoadingInBtn(false));

  //     if (!response.ok) {
  //       throw new Error("Failed to add Event");
  //     }

  //     const data = await response.json();
  //     console.log("event date", eventDate);

  //     console.log("Added Event:", data);

  //     Alert.alert(
  //       "Success",
  //       "Event Created successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error adding Event:", error);

  //     Alert.alert(
  //       "Error",
  //       "Failed to add temple",
  //       [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //       { cancelable: false }
  //     );
  //   }
  // };

  const handleSubmit = async () => {
    try {
      // Validate form before submission
      if (!validateDate() || !validateTimes() || !validateAvailability()) {
        return;
      }

      // Basic field validation
      if (!eventName.trim()) {
        Alert.alert("Validation Error", "Please enter an event name");
        return;
      }
      if (!eventType) {
        Alert.alert("Validation Error", "Please select an event type");
        return;
      }
      if (!eventDescription.trim()) {
        Alert.alert("Validation Error", "Please enter an event description");
        return;
      }
      if (!eventDuration) {
        Alert.alert("Validation Error", "Please enter event duration");
        return;
      }

      let token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Bearer token not found");
        return;
      }
      dispatch(setLoadingInBtn(true));
  
      const eventDate = selectedDate
        ? `${selectedDate.getDate().toString().padStart(2, "0")}/${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}/${selectedDate.getFullYear()}`
        : "";
  
      const eventTime = times.map((time) => formatTime(time));
  
      const formattedAvailability = availability.map((slot) => ({
        startTime: formatTime(slot[0]),
        endTime: formatTime(slot[1]),
      }));
  
      // Construct the base event data object
      let eventData = {
        eventName,
        eventDate,
        eventDescription,
        temple: templeId,
        eventType,
        eventDuration: parseInt(eventDuration),
      };
  
      // Conditionally add fields if the event is a "Pooja Event"
      if (eventType === "normal") {
        eventData = {
          ...eventData,
          eventTime,
        };
      }
  
      if (eventType === "puja") {
        eventData = {
          ...eventData,
          eventRequirements: poojaMaterials,
          availableSlots: formattedAvailability,
          instructions: poojaPractices,
          pandits: poojaPandit,
        };
      }
  
      console.log("sent event data", eventData);
  
      const response = await apiClient.post("/templeEvents", eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      dispatch(setLoadingInBtn(false));
  
      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error("Failed to add event");
      }
  
      const data = response.data;
      console.log("event date", eventDate);
      console.log("Added Event:", data);
  
      Alert.alert(
        "Success",
        "Event Created successfully",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error adding Event:", error);
  
      Alert.alert(
        "Error",
        "Failed to add temple",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };

  return (
    <SafeArea>
      <Provider>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
          enabled
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
                <View style={{ alignItems: "center", flexDirection: "row" }}>
                  <IconButton
                    icon="arrow-left"
                    size={28}
                    onPress={() => navigation.goBack()}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "500",
                      color: "#000",
                    }}
                  >
                    Add Event
                  </Text>
                </View>
              </RowBetween>
              <MainContainer
              style={{ 
                paddingBottom: keyboardVisible ? keyboardHeight + 20 : 56,
                flex: 1 
              }}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Event Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={eventName}
                onChangeText={(text) => setEventName(text)}
                returnKeyType="next"
                autoCapitalize="words"
                onSubmitEditing={() => {
                  // Focus next input if needed
                }}
              />
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="Description*"
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={eventDescription}
                onChangeText={(text) => setEventDescription(text)}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
                style={[
                  styles.input,
                  {
                    padding: 15,
                    borderRadius: 5,
                    fontSize: 16,
                    height: 100,
                    color: "black",
                    fontWeight: "400",
                    backgroundColor: "#F0F0F0",
                    marginTop: 20,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textAlignVertical: "top",
                  },
                ]}
              />

              {/* <TouchableOpacity onPress={openCalendar}>
                        <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={styles.input}
                        placeholder="Event Date (YYYY-MM-DD)*"
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        maxLength={10}
                        />
                    </TouchableOpacity> */}

              {/* <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isCalendarVisible}
                        onRequestClose={() => setCalendarVisible(false)}
                    >
                        <View style={styles.modalBackground}>
                            <View style={styles.calendarContainer}>
                                <Calendar
                                onDayPress={onDayPress}
                                markedDates={{
                                    [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' }
                                }}
                                minDate="today"
                                />
                            </View>
                        </View>
                    </Modal> */}

              {/* <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Event Type*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={eventType}
                onChangeText={(text) => setEventType(text)}
              /> */}

              <SelectDropdown
                data={["Regular Event", "Pooja Event"]}
                onSelect={(selectedItem, index) => {
                  const eventType =
                    selectedItem === "Pooja Event" ? "puja" : "normal";
                  setEventType(eventType);
                }}
                defaultButtonText="Select Event Type*"
                buttonTextAfterSelection={(selectedItem) => {
                  return selectedItem;
                }}
                rowTextForSelection={(item) => {
                  return item;
                }}
                buttonStyle={styles.dropdownBtnStyle}
                buttonTextStyle={styles.dropdownBtnTxtStyle}
                dropdownIconPosition="right"
                renderDropdownIcon={(isOpened) => {
                  return (
                    <Icon
                      name={isOpened ? "chevron-up" : "chevron-down"}
                      color={"#444"}
                      size={18}
                    />
                  );
                }}
                dropdownStyle={styles.dropdownDropdownStyle}
                rowStyle={styles.dropdownRowStyle}
                rowTextStyle={styles.dropdownRowTxtStyle}
              />

              {eventType === "puja" && (
                <>
                  <Text style={styles.label}>Pooja Requirements</Text>
                  {poojaMaterials.map((material, index) => (
                    <View key={index} style={styles.materialContainer}>
                      <TextInput
                        style={styles.materialInput}
                        placeholder="Pooja Requirement"
                        value={material}
                        onChangeText={(text) =>
                          updatePoojaMaterial(text, index)
                        }
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removePoojaMaterial(index)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <FormButton
                    onPress={addPoojaMaterial}
                    mode="contained"
                    style={{ marginTop: 10, backgroundColor: "#A9A9A9" }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Add Requirement
                    </Text>
                  </FormButton>

                  <View style={styles.container}>
                    <SelectDropdown
                      buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                      buttonTextStyle={{
                        textAlign: "left",
                        color: "#9B9B9B",
                        fontSize: 16,
                      }}
                      data={availablePandits}
                      defaultButtonText={
                        isCurrentUserPandit && currentUserPandit 
                          ? currentUserPandit.panditName
                          : "Select Pandit"
                      }
                      defaultValueByIndex={isCurrentUserPandit ? 0 : undefined}
                      onSelect={(selectedItem) => {
                        setPoojaPandit(selectedItem._id);
                      }}
                      buttonTextAfterSelection={(selectedItem) => {
                        return selectedItem.panditName;
                      }}
                      rowTextForSelection={(item) => {
                        return item.panditName;
                      }}
                      disabled={isCurrentUserPandit} // Disable if current user is pandit (can only select themselves)
                    />
                    {isCurrentUserPandit && (
                      <Text style={{ 
                        fontSize: 12, 
                        color: '#666', 
                        marginTop: 4,
                        fontStyle: 'italic'
                      }}>
                        You will be assigned as the pandit for this event
                      </Text>
                    )}
                  </View>

                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    placeholder="Pooja Instructions*"
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={poojaPractices}
                    onChangeText={(text) => setPoojaPractices(text)}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={Keyboard.dismiss}
                    style={[
                      styles.input,
                      {
                        padding: 15,
                        borderRadius: 5,
                        fontSize: 16,
                        height: 100,
                        color: "black",
                        fontWeight: "400",
                        backgroundColor: "#F0F0F0",
                        marginTop: 20,
                        paddingTop: 15,
                        borderColor: "#e6e6e6",
                        textAlignVertical: "top",
                      },
                    ]}
                  />

                  {/* Enhanced Time Slots for Puja Events */}
                  <View style={styles.dateTimeContainer}>
                    <Text style={styles.dateTimeLabel}>Available Time Slots *</Text>
                    
                    {availability.map((slot, index) => (
                      <View key={index} style={{
                        backgroundColor: '#F8F9FA',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#E9ECEF'
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 12
                        }}>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Slot {index + 1}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeSlot(index)}
                            style={{
                              backgroundColor: '#FF6B6B',
                              borderRadius: 8,
                              padding: 8
                            }}
                          >
                            <Icon name="trash-can" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                        
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          {/* Start Time */}
                          <TouchableOpacity
                            onPress={() => openSlotTimePicker(index, true)}
                            style={[
                              styles.dateTimeButton,
                              {
                                flex: 0.48,
                                backgroundColor: 'white',
                                minHeight: 48
                              }
                            ]}
                          >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Icon 
                                name="clock-start" 
                                size={20} 
                                color={slot[0] ? Theme.themeColor : '#999'} 
                                style={{marginRight: 8}}
                              />
                              <Text 
                                style={slot[0] ? styles.dateTimeText : styles.dateTimePlaceholder}
                              >
                                {slot[0] ? formatTime(slot[0]) : "Start"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          
                          {/* End Time */}
                          <TouchableOpacity
                            onPress={() => openSlotTimePicker(index, false)}
                            style={[
                              styles.dateTimeButton,
                              {
                                flex: 0.48,
                                backgroundColor: 'white',
                                minHeight: 48
                              }
                            ]}
                          >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Icon 
                                name="clock-end" 
                                size={20} 
                                color={slot[1] ? Theme.themeColor : '#999'} 
                                style={{marginRight: 8}}
                              />
                              <Text 
                                style={slot[1] ? styles.dateTimeText : styles.dateTimePlaceholder}
                              >
                                {slot[1] ? formatTime(slot[1]) : "End"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    {/* Add Slot Button */}
                    <TouchableOpacity 
                      onPress={addSlot}
                      style={[
                        styles.dateTimeButton,
                        {
                          backgroundColor: Theme.themeColor,
                          borderColor: Theme.themeColor
                        }
                      ]}
                    >
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon 
                          name="plus-circle" 
                          size={24} 
                          color="white" 
                          style={{marginRight: 12}}
                        />
                        <Text style={[styles.dateTimeText, {color: 'white'}]}>
                          Add Time Slot
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {showStartPicker && (
                      <DateTimePicker
                        value={new Date()}
                        mode="time"
                        display="default"
                        onChange={onSlotTimeChange}
                      />
                    )}

                    {showEndPicker && (
                      <DateTimePicker
                        value={new Date()}
                        mode="time"
                        display="default"
                        onChange={onSlotTimeChange}
                      />
                    )}
                  </View>
                </>
              )}

              {/* Enhanced Date Picker */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeLabel}>Select Event Date *</Text>
                <TouchableOpacity 
                  onPress={openCalendar}
                  style={[
                    styles.dateTimeButton, 
                    selectedDate && styles.dateTimeButtonActive
                  ]}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon 
                      name="calendar" 
                      size={24} 
                      color={selectedDate ? Theme.themeColor : '#999'} 
                      style={{marginRight: 12}}
                    />
                    <Text 
                      style={selectedDate ? styles.dateTimeText : styles.dateTimePlaceholder}
                    >
                      {selectedDate ? formatDisplayDate(selectedDate) : "Select date"}
                    </Text>
                  </View>
                  <Icon 
                    name="chevron-down" 
                    size={20} 
                    color={selectedDate ? Theme.themeColor : '#999'} 
                  />
                </TouchableOpacity>
              </View>

              {/* Calendar Modal */}
              <Modal
                visible={showCalendarModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowCalendarModal(false)}
              >
                <View style={styles.calendarModal}>
                  <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                      <Text style={styles.calendarTitle}>Select Date</Text>
                      <TouchableOpacity 
                        onPress={() => setShowCalendarModal(false)}
                        style={{padding: 8}}
                      >
                        <Icon name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <Calendar
                      onDayPress={onDayPress}
                      markedDates={{
                        [moment(selectedDate).format('YYYY-MM-DD')]: { 
                          selected: true, 
                          selectedColor: Theme.themeColor,
                          selectedTextColor: 'white'
                        }
                      }}
                      minDate={moment().format('YYYY-MM-DD')}
                      theme={{
                        selectedDayBackgroundColor: Theme.themeColor,
                        selectedDayTextColor: 'white',
                        todayTextColor: Theme.themeColor,
                        dayTextColor: '#333',
                        textDisabledColor: '#ccc',
                        arrowColor: Theme.themeColor,
                        monthTextColor: '#333',
                        textDayFontWeight: '600',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '600',
                        textSectionTitleColor: '#666',
                      }}
                    />
                  </View>
                </View>
              </Modal>

              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={selectedDate ? selectedDate : new Date()}
                  mode="date"
                  display="default"
                  onChange={onChange}
                />
              )}

              {eventType === "normal" && (
                <>
                  {/* Enhanced Time Picker for Normal Events */}
                  <View style={styles.dateTimeContainer}>
                    <Text style={styles.dateTimeLabel}>Event Times *</Text>
                    <TouchableOpacity 
                      onPress={openTimePicker}
                      style={[
                        styles.dateTimeButton
                      ]}
                    >
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon 
                          name="clock-outline" 
                          size={24} 
                          color={Theme.themeColor} 
                          style={{marginRight: 12}}
                        />
                        <Text style={styles.dateTimeText}>
                          Add Event Time
                        </Text>
                      </View>
                      <Icon 
                        name="plus" 
                        size={20} 
                        color={Theme.themeColor} 
                      />
                    </TouchableOpacity>
                    
                    {/* Selected Times Display */}
                    {times.length > 0 && (
                      <View style={styles.timeSlotContainer}>
                        {times.map((time, index) => (
                          <View key={index} style={styles.timeSlot}>
                            <Text style={styles.timeSlotText}>{formatTime(time)}</Text>
                            <TouchableOpacity
                              onPress={() => removeTime(index)}
                              style={styles.removeTimeButton}
                            >
                              <Icon name="close" size={12} color="white" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              )}
              {showTimePicker && (
                <DateTimePicker
                  testID="timePicker"
                  value={time || new Date()} // Use current time if no time is selected
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Event Duration (in minutes)"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                autoCapitalize="none"
                value={eventDuration}
                onChangeText={(text) => setEventDuration(text)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <FormButton onPress={handleSubmit}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn === true ? (
                    <ActivityIndicator
                      style={{
                        display: "flex",
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                      }}
                      // size={"large"}
                      color={"white"}
                    />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </FormButton>
            </FormSection>
              </MainContainer>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
};

export default TempleEventsCreate;

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    // marginTop: "10%",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
  dateTimeContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateTimeButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  dateTimeButtonActive: {
    borderColor: Theme.themeColor,
    backgroundColor: '#FFF8E1',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateTimePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  calendarModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  timeSlot: {
    backgroundColor: '#F1F3F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  removeTimeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    resizeMode: "cover",
    marginBottom: 24,
  },
  dateView: {
    marginTop: 24,
    backgroundColor: "#f0f0f0",
    borderColor: "#e6e6e6",
    borderRadius: 4,
    height: 50,
    textTransform: "capitalize",
    width: "100%",
    // color:"black"
    fontSize: 18,
  },

  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "grey",
    borderRadius: 5,
    padding: 10,
    margin: 5,
    position: "relative",
  },
  timeText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteIcon: {
    position: "absolute",
    top: -2,
    right: -2,
    borderRadius: 10,
    padding: 2,
    fontSize: 12,
    backgroundColor: "black",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  calendarContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownBtnStyle: {
    width: "100%",
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginVertical: 10,
  },
  dropdownBtnTxtStyle: {
    color: "#9B9B9B",
    textAlign: "left",
    fontSize: 16,
  },
  dropdownDropdownStyle: {
    backgroundColor: "#EFEFEF",
  },
  dropdownRowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdownRowTxtStyle: {
    color: "#444",
    textAlign: "left",
    fontSize: 16,
  },
  materialContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  materialInput: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    height: 50,
    color: "black",
    fontWeight: "400",
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: "#FF6F61",
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#FFF",
  },
  submitButton: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  timeContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "grey",
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
