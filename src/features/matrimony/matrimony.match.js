import React from "react";
import { View, Text, ImageBackground, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Background from "../../assets/images/general/chatback.png";
import { useNavigation } from "@react-navigation/native";

export default function MatrimonyMatch({ route }) {
  const { dp, myDp } = route.params;

  const navigation = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ImageBackground
        source={Background}
        resizeMode="cover"
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "bold",
              color: "#D4AF37",
              letterSpacing: 0.3,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Congratulations
          </Text>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "#D4AF37",
              letterSpacing: 0.3,
              textAlign: "center",
            }}
          >
            It's A Match
          </Text>
        </View>
        <View
          style={{
            flex: 0.5,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: 40,
          }}
        >
          <Image
            source={{
              uri: myDp,
            }}
            style={{
              width: "38%",
              height: "50%",
              marginRight: 0,
              borderRadius: 100,
              borderWidth: 5,
              borderColor: "#D4AF37",
            }}
          />
          <Image
            source={{
              uri: dp,
            }}
            style={{
              width: "38%",
              height: "50%",
              borderRadius: 100,
              borderWidth: 5,
              borderColor: "#D4AF37",
            }}
          />
        </View>

        <View>
          <TouchableOpacity
            style={{
              backgroundColor: "#D4AF37",
              borderRadius: 5,
              paddingHorizontal: 50,
              paddingVertical: 15,
              shadowColor: "#D4AF37",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#fff",
                textAlign: "center",
              }}
            >
              Start Conversation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              borderRadius: 5,
              paddingHorizontal: 50,
              paddingVertical: 15,
              shadowColor: "#D4AF37",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
              elevation: 5,
              marginTop: 20,
            }}
            onPress={() => navigation.navigate("Home")}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "black",
                textAlign: "center",
                opacity: 0.6,
              }}
            >
              Keep Swipping
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
