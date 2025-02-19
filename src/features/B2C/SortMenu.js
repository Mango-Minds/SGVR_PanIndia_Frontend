import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
const SortMenu = ({
  menuVisible,
  toggleMenu,
  sortOptions,
  selectedSortOption,
  handleButtonPress,
  setSelectedSortOption,
  selectedOptions,
  setSelectedFiltersArray,
  selectedFiltersArray,
  handleSortSelect,
}) => {
  console.log("Sort Options: ", sortOptions);

  const handleApply = () => {
    const selectedFilters = [];
    sortOptions.forEach((filter) => {
      const selectedOptionsForFilter = selectedOptions.filter((option) =>
        filter.options.includes(option)
      );
      if (selectedOptionsForFilter.length > 0) {
        selectedFilters.push({
          "Filter name": filter.label,
          Options: selectedOptionsForFilter,
        });
      }
    });
    setSelectedFiltersArray(selectedFilters);
    console.log(selectedFiltersArray);

    handleButtonPress("apply");
  };

  return (
    <View>
      {menuVisible && (
        <View
          style={{
            position: "absolute",
            top: -890,
            left: -50,
            right: -50,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        ></View>
      )}

      {menuVisible && (
        <View
          style={{
            position: "absolute",
            bottom: -80,
            backgroundColor: "white",
            borderRadius: 25,
            padding: 20,
            shadowColor: "#100",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            height: 350,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: -100,
                left: -20,
                width: 52,
                height: 54,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 25,
                  shadowColor: "#100",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Ionicons name="options-outline" size={32} color={Theme.themeColor} />
               
              </View>
            </TouchableOpacity>

            <View>
              <Text
                style={{
                  color: Theme.themeColor,
                  fontSize: 22,
                  marginBottom: 50,
                  marginLeft: 50,
                  top: -100,
                }}
              >
                Sort listings by
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              right: 190,
              bottom: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <ScrollView
                style={{ maxHeight: 170, width: 200 }}
                showsVerticalScrollIndicator={false}
              >
                {sortOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      top: 10,
                    }}
                    onPress={() => handleSortSelect(option.value)}
                  >
                    <Ionicons
                      name={
                        selectedSortOption === option.value
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={25}
                      color={
                        selectedSortOption === option.value
                          ? Theme.themeColor
                          : "black"
                      }
                    />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        color:
                          selectedSortOption === option.value
                            ? Theme.themeColor
                            : "black",
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {menuVisible && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 20,
            marginHorizontal: 20,
            top: 0,
            left: 140,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: selectedSortOption
                ? "transparent"
                : Theme.themeColor,
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: Theme.themeColor,
              marginRight: 70,
            }}
            onPress={() => {
              handleButtonPress("clear");
              setSelectedSortOption(null);
              console.log("Clear Sort");
            }}
          >
            <Text
              style={{ color: selectedSortOption ? Theme.themeColor : "white" }}
            >
              Clear Sort
            </Text>
          </TouchableOpacity>

          <View style={{ width: 90 }} />
        </View>
      )}

      {menuVisible && (
        <TouchableOpacity
          onPress={toggleMenu}
          style={{
            position: "absolute",
            bottom: 320,
            right: 170,
            zIndex: 3,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: 27,
              padding: 1,
            }}
          >
            <Ionicons name="close" size={50} color="white" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SortMenu;
