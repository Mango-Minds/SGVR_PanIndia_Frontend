import React, { useState, useEffect } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity, Animated, Modal } from "react-native";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import { SafeArea } from "../../components/utility/safe-area.component";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { RowBetween } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";

export default function MatrimonyProfileNew({ route, navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
    modelImages: [{ url: route.params.matrimonyData.image, props: { style: { width: "100%", height: "100%" } } }],
  });

  const [clickedButton, setClickedButton] = useState("ABOUT");
  const handleButtonPress = (buttonName) => {
    setClickedButton(buttonName);
  };

  const renderContent = () => {
    switch (clickedButton) {
      case "ABOUT":
        return (
          <View style={styles.about}>
            <View style={styles.aboutContent1}>
              <Text style={styles.aboutLabel1}>BIO</Text>
              <Text style={styles.aboutText1}>{route.params.matrimonyData.about}</Text>
            </View>

            <View style={styles.aboutContent2}>
              <Text style={styles.aboutLabel2}>REACH ME AT</Text>
              <View style={{ flexDirection: "row" }}>
                <IconButton icon="instagram" />
                <IconButton icon="linkedin" />
                <IconButton icon="twitter" />
                <IconButton icon="facebook" />
              </View>
            </View>

            <View style={styles.aboutContent3}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>WEBSITE</Text>
                <Text style={styles.aboutText3}>{route.params.matrimonyData.email}</Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>CONTACT</Text>
                <Text style={styles.aboutText3}>{route.params.matrimonyData.phone}</Text>
              </View>
            </View>
          </View>
        );
      case "WORK":
        return (
          <View style={styles.work}>
            <View style={styles.work1}>
              <Text style={{ fontWeight: "bold", fontSize: 16, paddingHorizontal: 10, paddingTop: 10 }}>TITLE</Text>
              <Text style={{ paddingHorizontal: 10, paddingBottom: 10 }}>{route.params.matrimonyData.occupation}</Text>

              <Text style={{ fontWeight: "bold", fontSize: 16, paddingHorizontal: 10, paddingTop: 10 }}>
                DESCRIPTION
              </Text>
              <Text style={{ fontSize: 14, paddingHorizontal: 10, paddingBottom: 10 }}>
                {route.params.matrimonyData.about}.
              </Text>
            </View>
          </View>
        );
      case "ACTIVITY":
        return (
          <View style={styles.work}>
            <View style={styles.work1}>
              <Text style={{ fontWeight: "bold", fontSize: 16, paddingHorizontal: 10, paddingTop: 10 }}>ACTIVITY</Text>
              {/* Add more ACTIVITY section content here */}
              <Text style={{ fontSize: 14, paddingHorizontal: 10, paddingBottom: 10 }}>
                Hobbies, Reading, Cooking, Gardening
              </Text>
              {/* Hardcoded hobbies text */}
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.about}>
            <View style={styles.aboutContent1}>
              <Text style={styles.aboutLabel1}>BIO</Text>
              <Text style={styles.aboutText1}>{route.params.matrimonyData.about}</Text>
            </View>

            <View style={styles.aboutContent2}>
              <Text style={styles.aboutLabel2}>REACH ME AT</Text>
              <View style={{ flexDirection: "row" }}>
                <IconButton icon="instagram" />
                <IconButton icon="linkedin" />
                <IconButton icon="twitter" />
                <IconButton icon="facebook" />
              </View>
            </View>

            <View style={styles.aboutContent3}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>WEBSITE</Text>
                <Text style={styles.aboutText3}>{route.params.matrimonyData.email}</Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>CONTACT</Text>
                <Text style={styles.aboutText3}>{route.params.matrimonyData.phone}</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeArea style={{ padding: 0, backgroundColor: "#FFF" }}>
      <View>
        <RowBetween style={{ paddingTop: 0 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}>Profile</TopText>
          </View>
        </RowBetween>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.imageContainerOuter}>
            <Image source={route.params.matrimonyData.image} resizeMode="cover" style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{route.params.matrimonyData.name}</Text>

              <Text style={styles.heading}>Email</Text>
              <Text style={styles.email}>{route.params.matrimonyData.email}</Text>

              <Text style={styles.heading}>Birthday</Text>
              <Text style={styles.birthday}>January 1, 1975</Text>

              <Text style={styles.heading}>City</Text>
              <Text style={styles.address}>{route.params.matrimonyData.city}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={() => handleButtonPress("ABOUT")}
            style={clickedButton === "ABOUT" ? styles.activeButton : styles.button}
          >
            <Text style={clickedButton === "ABOUT" ? styles.activeButtonText : styles.buttonText}>ABOUT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleButtonPress("WORK")}
            style={clickedButton === "WORK" ? styles.activeButton : styles.button}
          >
            <Text style={clickedButton === "WORK" ? styles.activeButtonText : styles.buttonText}>WORK</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleButtonPress("ACTIVITY")}
            style={clickedButton === "ACTIVITY" ? styles.activeButton : styles.button}
          >
            <Text style={clickedButton === "ACTIVITY" ? styles.activeButtonText : styles.buttonText}>HOBBIES</Text>
          </TouchableOpacity>
        </View>
        <View>{renderContent()}</View>

        {/* Modal for the image */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image source={route.params.matrimonyData.image} resizeMode="contain" style={styles.fullImage} />
            <IconButton icon="close" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  // For Image Card in top

  imageContainerOuter: {
    height: 300,
    margin: 20,
    backgroundColor: "#D4AF37",
    zIndex: 1,
    borderRadius: 20,
    flexDirection: "row",
  },

  image: {
    width: "50%",
    height: 280,
    borderRadius: 20,
    margin: 10,
    objectFit: "cover",
  },

  fullImage: {
    width: "100%",
    height: "100%",
  },

  heading: {
    fontSize: 14,
    fontWeight: "bold",
    margin: 0,
  },

  textContainer: {
    margin: 10,
    width: "50%",
  },

  name: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },

  email: {
    fontSize: 16,
    marginBottom: 10,
  },

  birthday: {
    fontSize: 16,
    marginBottom: 10,
  },

  address: {
    fontSize: 16,
    marginBottom: 5,
  },

  // For Button Menu

  buttonGroup: {
    flexDirection: "row",
    width: "60%",
    height: 40,
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFF",
    marginBottom: 20,
    borderRadius: 40,
    paddingHorizontal: 5,
  },

  button: {
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },

  activeButton: {
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D4AF37",
  },

  activeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  // For the content of ABOUT

  aboutContent1: {
    width: "90%",
    height: "auto",
    backgroundColor: "#D4AF37",
    // justifyContent: "center",
    alignSelf: "center",
    borderRadius: 20,
    flexDirection: "column",
    marginBottom: 15,
  },

  aboutLabel1: {
    fontWeight: "bold",
    fontSize: 14,
    marginHorizontal: 15,
    marginVertical: 5,
  },

  aboutText1: {
    fontSize: 14,
    marginHorizontal: 15,
    marginBottom: 5,
    textAlign: "justify",
  },

  aboutContent2: {
    width: "90%",
    height: "auto",
    backgroundColor: "#D4AF37",
    // justifyContent: "center",
    alignSelf: "center",
    borderRadius: 20,
    flexDirection: "column",
    marginBottom: 15,
  },

  aboutLabel2: {
    fontWeight: "bold",
    fontSize: 14,
    marginHorizontal: 15,
    marginVertical: 5,
  },

  aboutText2: {
    fontSize: 14,
    marginHorizontal: 15,
    marginBottom: 5,
    textAlign: "justify",
  },

  aboutContent3: {
    width: "90%",
    height: 70,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 20,
    flexDirection: "column",
    marginBottom: 10,
  },

  aboutLabel3: {
    fontWeight: "bold",
    fontSize: 14,
    marginHorizontal: 15,
    marginVertical: 5,
  },

  aboutText3: {
    fontSize: 14,
    marginHorizontal: 15,
    marginVertical: 5,
  },

  // WORK

  work: {
    flexDirection: "column",
  },

  work1: {
    flexDirection: "column",
    marginHorizontal: 20,
    backgroundColor: "#D4AF37",
    width: "90%",
    height: "auto",
    borderRadius: 20,
    marginBottom: 20,
  }, // Styles for the content of ACTIVITY
  content: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#D4AF37",
    borderRadius: 20,
    padding: 15,
  },
  contentText: {
    fontSize: 14,
    color: "#000",
  },
});
