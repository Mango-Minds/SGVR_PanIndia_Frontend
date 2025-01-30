import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FilterMenu = ({
  menuVisible,
  toggleMenu,
  filters,
  activeFilter,
  selectedOptions,
  handleFilterClick,
  handleOptionClick,
  handleButtonPress,
  selectedFiltersArray,
  setSelectedFiltersArray,
}) => {
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleApply = () => {
    const selectedFilters = [];

    filters.forEach((filter) => {
      const selectedOptionsForFilter = selectedOptions.filter((option) =>
        filter.options.includes(option)
      );

      if (selectedOptionsForFilter.length > 0) {
        selectedFilters.push({
          "Filter name": filter.name,
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
            left: 2,
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
            height: 400,
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
              <View style={{ position: "absolute", top: -30, left: 17 }}>
                <Ionicons name="square" size={32} color="#D4AF37" />
                <View style={{ position: "absolute", top: -1, left: -2 }}>
                  <Ionicons name="funnel" size={22} color="lightgrey" />
                </View>
              </View>
            </TouchableOpacity>

            <View>
              <Text
                style={{
                  // color: "black",
                  color: "#D4AF37",
                  fontSize: 22,
                  marginBottom: 50,
                  marginLeft: 30,
                  top: -130,
                }}
              >
                Filters
              </Text>
            </View>
          </View>

          <View
            style={{
              borderLeftWidth: 1,
              height: "55%",
              borderColor: "lightgrey",
              marginHorizontal: 10,
              left: 85,

              marginBottom: 60,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              left: -80,
              top: -35,
            }}
          >
           
            <View style={{ flex: 1 }}>
              <ScrollView
                style={{ maxHeight: 170, width: 200 }}
                showsVerticalScrollIndicator={false}
              >
                {filters.map((filter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => handleFilterClick(filter.name)}
                  >
                    <Text
                      style={{
                        color: activeFilter === filter.name ? "#D4AF37" : "grey",
                        fontSize: 20,
                        marginRight: 20,
                      }}
                    >
                      {filter.name}
                    </Text>

                    {selectedOptions.some((option) =>
                      filter.options.includes(option)
                    ) && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#D4AF37",
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 14 }}>
                          {
                            selectedOptions.filter((option) =>
                              filter.options.includes(option)
                            ).length
                          }
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
              <ScrollView
                style={{ maxHeight: 170, width: 200 }}
                showsVerticalScrollIndicator={false}
              >
                {activeFilter &&
                  filters.map((filter) =>
                    filter.name === activeFilter
                      ? filter.options.map((option, index) => (
                          <TouchableOpacity
                            key={index}
                            style={{
                              padding: 10,
                              flexDirection: "row",
                              alignItems: "center",
                              top: 10,
                            }}
                            onPress={() => handleOptionClick(option)}
                          >
                            <Ionicons
                              name={
                                selectedOptions.includes(option)
                                  ? "checkbox"
                                  : "square-outline"
                              }
                              size={25}
                              color={
                                selectedOptions.includes(option)
                                  ? "#D4AF37"
                                  : "grey"
                              }
                            />
                            <Text
                              style={{
                                marginLeft: 10,
                                fontSize: 16,
                                color: selectedOptions.includes(option)
                                  ? "#D4AF37"
                                  : "grey",
                              }}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))
                      : null
                  )}
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

            top: 10,
            left: 10,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: activeFilter ? "#D4AF37" : "transparent",
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: "#D4AF37",
              marginLeft: 15,
            }}
            onPress={() => {
              handleButtonPress("clear");
              setSelectedFilters([]);
              console.log("Clear Filters");
            }}
          >
            <Text style={{ color: activeFilter ? "white" : "#D4AF37" }}>
              Clear Filters
            </Text>
          </TouchableOpacity>

          <View style={{ width: 90 }} />

          <TouchableOpacity
            style={{
              backgroundColor: activeFilter ? "transparent" : "#D4AF37",
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: "#D4AF37",
              marginRight: 60,
            }}
            onPress={handleApply}
          >
            <Text style={{ color: activeFilter ? "#D4AF37" : "white" }}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
       
      )}

      {menuVisible && (
        <TouchableOpacity
          onPress={toggleMenu}
          style={{
            position: "absolute",
            bottom: 360,
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

export default FilterMenu;
