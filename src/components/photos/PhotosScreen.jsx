import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import SocialCard from "../social/SocialCard";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import OptionsModal from "../modals/OptionsModal";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.2)",
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  container: {
    backgroundColor: "white",
    paddingTop: 24,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingBottom: 12,
  },
});
export default function PhotosScreen({ navigation, route }) {
  const { loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { data } = route.params || { data: socialData };
  const slideUpRef = useRef();

  const [modalVisible, setModalVisible] = useState(false);
  const options = [
    {
      title: "Delete",
      titleStyle: { color: "red" },
      function: () => {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Deleted Successfully",
            type: "success",
          })
        );
      },
    },
  ];
  return (
    <Container style={{ backgroundColor: "#FAFAFA" }}>
      <RowBetween
        style={{ paddingTop: 24, paddingBottom: 8, paddingRight: 16 }}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={{ alignItems: "center" }}>
          <TopText style={{ color: "#000000", fontWeight: "bold" }}>
            Photos
          </TopText>
        </View>
      </RowBetween>

      <ScrollView showsVerticalScrollIndicator={false}>
        {data?.map((item, index) => (
          <SocialCard
            {...item}
            key={index}
            slideUpRef={slideUpRef}
            navigation={navigation}
          />
        ))}
      </ScrollView>
      <OptionsModal slideUpRef={slideUpRef} options={options} />
    </Container>
  );
}
