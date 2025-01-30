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
import { Picker } from "@react-native-picker/picker";
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
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base-64";
import { useRoute } from "@react-navigation/native";

const TempleEventEdit = ({ navigation }) => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const route = useRoute();
  const { event } = route.params;
  const { templePandits } = route.params;

  const [eventName, setEventName] = useState(event.eventName);
  const [eventType, setEventType] = useState(event.eventType);
  const [eventDescription, setEventDescription] = useState(
    event.eventDescription
  );
  const [eventDuration, setEventDuration] = useState(event.eventDuration);
  const [selectedDate, setSelectedDate] = useState(event.eventDate);
  const [times, setTimes] = useState(event.eventTime);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [show, setShow] = useState(false);
  const { loadingInBtn } = useSelector((state) => state.user);

  const [poojaMaterials, setPoojaMaterials] = useState(
    event.eventRequirements || []
  );
  const [poojaPandit, setPoojaPandit] = useState(
    event.pandits ? event.pandits.panditName : ""
  );
  const [poojaPanditId, setPoojaPanditId] = useState(
    event.pandits ? event.pandits._id : ""
  );
  const [poojaPractices, setPoojaPractices] = useState(
    event.instructions || ""
  );

  const [availability, setAvailability] = useState(event.availableSlots || []);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isStartTime, setIsStartTime] = useState(true);

  // Add a new slot with default times and booked status
  const addSlot = () => {
    setAvailability([
      ...availability,
      { startTime: "", endTime: "", isBooked: false },
    ]);
  };

  // Update the start or end time of a slot based on the index
  const updateSlot = (index, value, isStart) => {
    const updatedSlots = availability.map((slot, i) => {
      if (i === index) {
        return {
          ...slot,
          startTime: isStart ? value : slot.startTime,
          endTime: isStart ? slot.endTime : value,
        };
      }
      return slot;
    });
    setAvailability(updatedSlots);
  };

  // Remove a slot based on its index
  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  // Handle the time picker change event
  const onSlotTimeChange = (event, selectedTime) => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5); // Extract HH:MM format
      updateSlot(selectedSlotIndex, timeString, isStartTime);
    }
  };

  // Open the time picker for a slot
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
    const updatedMaterials = poojaMaterials.filter((_, i) => i !== index);
    setPoojaMaterials(updatedMaterials);
  };

  const updatePoojaMaterial = (text, index) => {
    const updatedMaterials = poojaMaterials.map((material, i) =>
      i === index ? text : material
    );
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
    const formattedTimePattern = /^\d{1,2}:\d{2}$/; // Pattern for 24-hour time format without AM/PM
    if (formattedTimePattern.test(time)) {
      return time; // If already in 24-hour format, return as is
    }
    const dateTime = new Date(time);
    let hours = dateTime.getHours();
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");
    hours = hours.toString().padStart(2, "0"); // Ensure two digits for hours
    const strTime = `${hours}:${minutes}`;
    return strTime;
  };

  const openCalendar = () => {
    setShow(true);
  };

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (event.type === "set") {
      const currentDate = selectedDate || new Date();
      setSelectedDate(currentDate);
    }
  };

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setCalendarVisible(false); // Close the calendar when a date is selected
  };

  const handleSubmit = async () => {
    try {
      if (!token) {
        console.error("Bearer token not found");
        return;
      }
      dispatch(setLoadingInBtn(true));
      const eventDate = formatDate(selectedDate);
      const eventTime = times.map((time) => formatTime(time));
      const formattedAvailability = availability.map((slot) => ({
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime),
        isBooked: slot.isBooked, // Retain the isBooked property if needed
      }));

      // Construct the base event data object
      let eventData = {
        eventName,
        eventDate,
        eventDescription,
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
          pandits: poojaPanditId,
        };
      }

      const response = await fetch(`${BASEAPIURL}/templeEvents/${event._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      dispatch(setLoadingInBtn(false));

      if (!response.ok) {
        throw new Error("Failed to edit Event");
      }

      const data = await response.json();
      console.log("event date", eventDate);

      console.log("Edited Event:", data);

      Alert.alert(
        "Success",
        "Event Edited successfully",
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
      console.error("Error Edit Event:", error);

      Alert.alert(
        "Error",
        "Failed to Edit event",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };

  const isDateFormatted = (date) => {
    const formattedDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    return formattedDatePattern.test(date);
  };

  const formatDate = (date) => {
    if (isDateFormatted(date)) {
      return date;
    }
    return new Date(date).toISOString().split("T")[0];
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
                Edit Event
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
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Event Name
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Event Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={eventName}
                onChangeText={(text) => setEventName(text)}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Event Description
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor="#d4af37"
                placeholder="Description*"
                activeUnderlineColor="#d4af37"
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
                    marginTop: 5,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                  },
                ]}
              />

              {/* <TouchableOpacity onPress={openCalendar}>
                        <LoginInputField
                        selectionColor="#d4af37"
                        activeUnderlineColor="#d4af37"
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
              <SelectDropdown
                data={["Regular Event", "Pooja Event"]}
                onSelect={(selectedItem, index) => {
                  const eventType =
                    selectedItem === "Pooja Event" ? "puja" : "normal";
                  setEventType(eventType);
                }}
                defaultValue={
                  eventType === "puja" ? "Pooja Event" : "Regular Event"
                }
                defaultButtonText="Select Event Type*"
                buttonTextAfterSelection={(selectedItem) => {
                  return selectedItem;
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
                  <Text style={styles.label}>Pooja Materials</Text>
                  {poojaMaterials.map((material, index) => (
                    <View key={index} style={styles.materialContainer}>
                      <TextInput
                        style={styles.materialInput}
                        placeholder="Pooja Material"
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
                      Add Material
                    </Text>
                  </FormButton>

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    Pooja Pandit
                  </Text>

                  <SelectDropdown
                    buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    data={templePandits}
                    defaultButtonText={poojaPandit || "Select Pandit"} // Display default pandit name or placeholder text
                    onSelect={(selectedItem) => {
                      setPoojaPandit(selectedItem.panditName); // Update name state
                      setPoojaPanditId(selectedItem._id); // Update ID state
                    }}
                    buttonTextAfterSelection={(selectedItem) => {
                      return selectedItem.panditName; // Display the name of the selected pandit
                    }}
                    rowTextForSelection={(item) => {
                      return item.panditName; // Display pandit names in the dropdown
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    Pooja Instructions
                  </Text>

                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    selectionColor="#d4af37"
                    activeUnderlineColor="#d4af37"
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
                        marginTop: 10,
                        paddingTop: 15,
                        borderColor: "#e6e6e6",
                      },
                    ]}
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    Available Slots
                  </Text>

                  <View>
                    {availability.map((slot, index) => (
                      <View key={index} style={styles.timeContainer}>
                        <TouchableOpacity
                          onPress={() => openSlotTimePicker(index, true)}
                        >
                          <TextInput
                            style={styles.timeInput}
                            placeholder="Start Time"
                            value={
                              slot.startTime ? formatTime(slot.startTime) : ""
                            }
                            editable={false}
                          />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, color: "grey" }}>To</Text>
                        <TouchableOpacity
                          onPress={() => openSlotTimePicker(index, false)}
                        >
                          <TextInput
                            style={styles.timeInput}
                            placeholder="End Time"
                            value={slot.endTime ? formatTime(slot.endTime) : ""}
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
                        Add New Slot
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

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Event Date
              </Text>

              <TouchableOpacity onPress={openCalendar}>
                <LoginInputField
                  value={selectedDate ? formatDate(selectedDate) : ""}
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 5 }]}
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
                  value={selectedDate ? new Date(selectedDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onChange}
                />
              )}
              {eventType === "normal" && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    Event Time
                  </Text>

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
                      value={time ? formatTime(time) : ""}
                      selectionColor="#d4af37"
                      activeUnderlineColor="#d4af37"
                      style={[
                        styles.input,
                        {
                          marginTop: 5,
                          textAlign: "center",
                          backgroundColor: "#A9A9A9",
                        },
                      ]}
                      placeholder="Select Event Time*"
                      underlineColor="transparent"
                      placeholderTextColor="white"
                      autoCapitalize="none"
                      editable={false} // Make the input field non-editable
                    />
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      testID="timePicker"
                      value={time || new Date()} // Use current time if no time is selected
                      mode="time"
                      display="default"
                      onChange={onTimeChange}
                    />
                  )}
                </>
              )}

              <Text
                style={{
                  fontSize: 16,
                  color: "grey",
                  fontWeight: "600",
                  marginLeft: 4,
                  marginTop: 20,
                }}
              >
                Event Duration
              </Text>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Event Duration*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                autoCapitalize="none"
                value={String(eventDuration)}
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

export default TempleEventEdit;

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
    marginTop: 10,
    color: "grey",
    fontWeight: "600",
    marginLeft: 4,
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
