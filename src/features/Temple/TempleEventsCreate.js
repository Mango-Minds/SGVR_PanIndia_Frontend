import React, { useState } from "react";
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
} from "react-native";
import Theme from "../../styles/theme";
import { Button, IconButton, Provider } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [show, setShow] = useState(false);
  const { loadingInBtn } = useSelector((state) => state.user);

  const [poojaMaterials, setPoojaMaterials] = useState([]);
  const [poojaPandit, setPoojaPandit] = useState("");
  const [poojaPractices, setPoojaPractices] = useState("");

  const [availability, setAvailability] = useState([["", ""]]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isStartTime, setIsStartTime] = useState(true);

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
    setShow(true);
  };

  // const onChange = (event, selectedDate) => {
  //   setShow(false);
  //   if (event.type === "set") {
  //     const currentDate = selectedDate || new Date();
  //     setSelectedDate(currentDate);
  //   }
  // };
  const onChange = (event, date) => {
    setShow(false);
    if (event.type === "set" && date) {
      setSelectedDate(date);
    }
  };
  
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setCalendarVisible(false); // Close the calendar when a date is selected
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
        <ScrollView showsVerticalScrollIndicator={false}>
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
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
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
                      data={templePandits}
                      defaultButtonText="Select Pandit"
                      onSelect={(selectedItem) => {
                        console.log(selectedItem._id)
                        setPoojaPandit(selectedItem._id);
                      }}
                      buttonTextAfterSelection={(selectedItem) => {
                        return selectedItem.panditName;
                      }}
                      rowTextForSelection={(item) => {
                        return item.panditName;
                      }}
                  
                    />
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
                      },
                    ]}
                  />

                  <View>
                    {availability.map((slot, index) => (
                      <View key={index} style={styles.timeContainer}>
                        <TouchableOpacity
                          onPress={() => openSlotTimePicker(index, true)}
                        >
                          <TextInput
                            style={styles.timeInput}
                            placeholder="Start Time"
                            value={slot[0] ? formatTime(slot[0]) : ""}
                            editable={false}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openSlotTimePicker(index, false)}
                        >
                          <TextInput
                            style={styles.timeInput}
                            placeholder="End Time"
                            value={slot[1] ? formatTime(slot[1]) : ""}
                            editable={false}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeSlot(index)}
                        >
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <FormButton
                      onPress={addSlot}
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
                        Add Availability
                      </Text>
                    </FormButton>

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

              <TouchableOpacity onPress={openCalendar}>
                <LoginInputField
                value={
                  selectedDate
                    ? `${selectedDate.getDate().toString().padStart(2, "0")}/${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}/${selectedDate.getFullYear()}`
                    : ""
                }
                
                  // value={
                  //   selectedDate ? selectedDate.toISOString().split("T")[0] : ""
                  // } // Display the selected date
                  selectionColor={Theme.themeColor}
                  activeUnderlineColor={Theme.themeColor}
                  style={styles.input}
                  placeholder="Event Date (YYYY-MM-DD)*"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  keyboardType="numeric"
                  maxLength={10}
                  editable={false} // Make the input field non-editable
                />
              </TouchableOpacity>
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
                  <View style={styles.timesContainer}>
                    {times.map((time, index) => (
                      <View key={index} style={styles.timeBox}>
                        <Text style={styles.timeText}>{formatTime(time)}</Text>
                        <TouchableOpacity
                          onPress={() => removeTime(index)}
                          style={styles.deleteIcon}
                        >
                          <Icon name="close" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity onPress={openTimePicker}>
                    <LoginInputField
                      value={time ? formatTime(time) : ""} // Display the selected time or an empty string
                      selectionColor={Theme.themeColor}
                      activeUnderlineColor={Theme.themeColor}
                      style={[
                        styles.input,
                        {
                          marginTop: 7,
                          textAlign: "center",
                          backgroundColor: "#A9A9A9",
                        },
                      ]}
                      placeholder="Event Time*"
                      underlineColor="transparent"
                      placeholderTextColor="white"
                      autoCapitalize="none"
                      editable={false} // Make the input field non-editable
                    />
                  </TouchableOpacity>
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
        </ScrollView>
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
