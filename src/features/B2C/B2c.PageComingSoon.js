import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { RowBetween } from "../../styles/common.styles";
import Theme from "../../styles/theme";

const PageComingSoon = ({ navigation }) => {
  return (
    <View style={styles.page}>
      <RowBetween style={{ paddingTop: 0 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        </View>
      </RowBetween>
      <View style={styles.coming}>
        <Text style={styles.text}>Page Coming Soon</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1, // Make the page take up the full screen
    marginTop:20,
  },
  coming: {
    flex: 1, // Make the coming view take up the remaining space
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
    color: Theme.themeColor,
  },
});

export default PageComingSoon;