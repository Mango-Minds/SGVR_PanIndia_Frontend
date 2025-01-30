import React from "react";
import {
  Image,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import CommingsoonImage from "../assets/images/homepage/cs.png";

const CommingSoon = ({ navigation }) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          // flexDirection : "row",
          alignItem: "center",
          paddingHorizontal: 20,
        }}
      >
        <Image
          source={CommingsoonImage}
          style={{
            marginHorizontal: 30,
          }}
        />
        <Text
          style={{
            fontSize: 30,
            fontWeight: "600",
            marginTop: 40,
            textAlign: "center",
            color: "#B98C13",
          }}
        >
          Coming Soon...
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            marginTop: 5,
            textAlign: "center",
            color: "#686868",
            opacity: 0.5,
          }}
        >
          We have more exciting features coming for you
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            marginTop: 10,
            textAlign: "center",
            color: "#686868",
          }}
        >
          Stay Tune !!!
        </Text>
        <TouchableOpacity
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItem: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <View
            style={{
              backgroundColor: "#B98C13",
              marginTop: 40,
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Explore More
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CommingSoon;
