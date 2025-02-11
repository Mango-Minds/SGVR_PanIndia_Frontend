import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "../../styles/theme";
const SortMenu = ({

menuVisible,
toggleMenu,
sortOptions, 
selectedSortOption,
handleOptionClick, 
handleButtonPress,
setSelectedSortOption, 
selectedOptions,
setSelectedFiltersArray,
selectedFiltersArray,
fetchProducts

}) => {
  console.log("Sort Options: ",sortOptions);
  const [selectedFilters, setSelectedFilters] = useState([]);

//   const handleApply = () => {
//     const selectedFilters = [];

//     sortOptions.forEach((filter) => {
//       const selectedOptionsForFilter = selectedOptions.filter((option) =>
//         filter.options.includes(option)
//       );

//       if (selectedOptionsForFilter.length > 0) {
//         selectedFilters.push({
//           "Filter name": filter.label,
//           Options: selectedOptionsForFilter,
//         });
//       }
//     });
//     setSelectedFiltersArray(selectedFilters);

//     console.log(selectedFiltersArray);

//     handleButtonPress("apply");
//   };


  
  
//   const handleSortOptionClick = (optionValue) => {
//     setSelectedSortOption(optionValue); 
//   };

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
  
const handleSortOptionClick = (optionValue) => {
    setSelectedSortOption(optionValue);
   // fetchProducts(searchTerm, selectedFiltersArray, optionValue); 
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
            ></TouchableOpacity>

            <View>
              <Text
                style={{
                  color: Theme.themeColor,
                  fontSize: 22,
                  marginBottom: 50,
                  marginLeft: 30,
                  top: -130,
                }}
              >
                Sort Listings
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              right: 120,
              bottom: 30,
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
                    onPress={() => handleSortOptionClick(option.value)} // Handle the radio button click
                  >
                    <Ionicons
                      name={
                        selectedSortOption === option.value
                          ? "radio-button-on" // Selected radio button
                          : "radio-button-off" // Unselected radio button
                      }
                      size={25}
                      color={
                        selectedSortOption === option.value
                          ? Theme.themeColor // Selected color
                          : "grey" // Unselected color
                      }
                    />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        color:
                          selectedSortOption === option.value
                            ? Theme.themeColor
                            : "grey",
                      }}
                    >
                      {option.label} {/* Displaying the sort option label */}
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
            left: 10,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: selectedSortOption ? Theme.themeColor : "transparent",
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: Theme.themeColor,
              marginLeft: 40,
            }}
            onPress={() => {
              handleButtonPress("clear");
              setSelectedSortOption(null); // Clear the selected sort option
              console.log("Clear Sort");
            }}
          >
            <Text style={{ color: selectedSortOption ? "white" : Theme.themeColor }}>
              Clear Sort
            </Text>
          </TouchableOpacity>

          <View style={{ width: 90 }} />

          <TouchableOpacity
            style={{
              backgroundColor: selectedSortOption ? "transparent" : Theme.themeColor,
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: Theme.themeColor,
              marginRight: 70,
            }}
            onPress={handleApply}
          >
            <Text style={{ color: selectedSortOption ? Theme.themeColor : "white" }}>
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



export default SortMenu;
//   return (
//     <View>
//       {menuVisible && (
//         <View
//           style={{
//             position: "absolute",
//             top: -890,
//             left: -50,
//             right: -50,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.5)",
//           }}
//         ></View>
//       )}

//       {menuVisible && (
//         <View
//           style={{
//             position: "absolute",
//             bottom: -80,
//             backgroundColor: "white",
//             borderRadius: 25,
//             padding: 20,
//             shadowColor: "#100",
//             shadowOffset: {
//               width: 0,
//               height: 2,
//             },
//             shadowOpacity: 0.25,
//             shadowRadius: 3.84,
//             elevation: 5,
//             height: 400,
//             width: "100%",
//             flexDirection: "row",
//             alignItems: "center",
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//             }}
//           >
//             <TouchableOpacity
//               style={{
//                 position: "absolute",
//                 top: -100,
//                 left: -20,
//                 width: 52,
//                 height: 54,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             ></TouchableOpacity>

//             <View>
//               <Text
//                 style={{
//                   color: Theme.themeColor,
//                   fontSize: 22,
//                   marginBottom: 50,
//                   marginLeft: 30,
//                   top: -130,
//                 }}
//               >
//                 Sort Listings
//               </Text>
//             </View>
//           </View>

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "flex-start",
//               justifyContent: "space-between",
//               left: -80,
//               top: -35,
//             }}
//           >
//             <View style={{ flex: 1 }}>
//               <ScrollView
//                 style={{ maxHeight: 170, width: 200 }}
//                 showsVerticalScrollIndicator={false}
//               >
//                 {activeFilter &&
//                   filters.map((filter) =>
//                     filter.label === activeFilter
//                       ? filter.options.map((option, index) => (
//                           <TouchableOpacity
//                             key={index}
//                             style={{
//                               padding: 10,
//                               flexDirection: "row",
//                               alignItems: "center",
//                               top: 10,
//                             }}
//                             onPress={() => handleOptionClick(option)} // Now handles radio button selection
//                           >
//                             <Ionicons
//                               name={
//                                 selectedOptions === option
//                                   ? "radio-button-on" // Selected radio button
//                                   : "radio-button-off" // Unselected radio button
//                               }
//                               size={25}
//                               color={
//                                 selectedOptions === option
//                                   ? Theme.themeColor // Selected color
//                                   : "grey" // Unselected color
//                               }
//                             />
//                             <Text
//                               style={{
//                                 marginLeft: 10,
//                                 fontSize: 16,
//                                 color:
//                                   selectedOptions === option
//                                     ? Theme.themeColor
//                                     : "grey",
//                               }}
//                             >
//                               {option}
//                             </Text>
//                           </TouchableOpacity>
//                         ))
//                       : null
//                   )}
//               </ScrollView>
//             </View>
//           </View>
//         </View>
//       )}

//       {menuVisible && (
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginVertical: 20,
//             marginHorizontal: 20,

//             top: 10,
//             left: 10,
//           }}
//         >
//           <TouchableOpacity
//             style={{
//               backgroundColor: activeFilter ? Theme.themeColor : "transparent",
//               borderRadius: 4,
//               paddingVertical: 10,
//               paddingHorizontal: 20,
//               borderWidth: 1,
//               borderColor: Theme.themeColor,
//               marginLeft: 20,
//             }}
//             onPress={() => {
//               handleButtonPress("clear");
//               setSelectedFilters([]);
//               console.log("Clear Filters");
//             }}
//           >
//             <Text style={{ color: activeFilter ? "white" : Theme.themeColor }}>
//               Clear Filters
//             </Text>
//           </TouchableOpacity>

//           <View style={{ width: 90 }} />

//           <TouchableOpacity
//             style={{
//               backgroundColor: activeFilter ? "transparent" : Theme.themeColor,
//               borderRadius: 4,
//               paddingVertical: 10,
//               paddingHorizontal: 20,
//               borderWidth: 1,
//               borderColor: Theme.themeColor,
//               marginRight: 50,
//             }}
//             onPress={handleApply}
//           >
//             <Text style={{ color: activeFilter ? Theme.themeColor : "white" }}>
//               Apply
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {menuVisible && (
//         <TouchableOpacity
//           onPress={toggleMenu}
//           style={{
//             position: "absolute",
//             bottom: 360,
//             right: 170,
//             zIndex: 3,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "rgba(0, 0, 0, 0.5)",
//               borderRadius: 27,
//               padding: 1,
//             }}
//           >
//             <Ionicons name="close" size={50} color="white" />
//           </View>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

// const handleApply = () => {
//     // Pass the selected sort option to the parent component or API call
//     if (selectedSortOption) {
//       handleButtonPress("apply", selectedSortOption);
//     }
//   };

  // This function is triggered when a user selects a sort option
  