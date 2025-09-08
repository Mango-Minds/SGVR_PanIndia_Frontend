import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  SafeAreaView,
} from "react-native";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import Theme from "../../styles/theme";
import { useTranslation } from "react-i18next";

const ProfileHeader = ({ title, onEditPress }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <TopText style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}>
          {title}
        </TopText>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {onEditPress && (
          <IconButton
            icon="pencil"
            iconColor={Theme.themeColor}
            size={24}
            onPress={onEditPress}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
});
