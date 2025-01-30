import React from "react";
import { Image, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Row } from "../../styles/dashboard.styles";
import { FormButton } from "../../styles/prelogin.styles";
import { UnfollowModalContainer } from "../../styles/social.styles";
import RBSheet from "react-native-raw-bottom-sheet";
import axios from "axios";
import { unfollowUser } from "../../services/socialMedia.services";
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

export default function UnfollowModal({
  slideUpRef,
  img,
  name,
  mainRef,
  data,
}) {
  const handleUnfollow = async () => {
    id = data.id;
    const res = await unfollowUser({ userId: id });
  };

  return (
    <RBSheet
      animationType="fade"
      ref={slideUpRef}
      openDuration={250}
      closeOnDragDown={false}
      dragFromTopOnly={false}
      closeOnPressMask={false}
      customStyles={{
        container: {
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,
          height: "auto",
          paddingBottom: 28,
        },
        draggableIcon: {
          backgroundColor: "black",
        },
      }}
    >
      <UnfollowModalContainer style={styles.container}>
        {/* <Image
          source={{ uri: img }}
          style={{ width: 46, height: 46, borderRadius: 6, marginVertical: 8 }}
        />
        <Text
          style={{ fontWeight: "bold", color: "#454F63", marginVertical: 8 }}
        >
          {name}
        </Text> */}
        <Text
          style={{ fontWeight: "normal", color: "#454F63", marginVertical: 8 }}
        >
          Are you sure you want to unfollow{" "}
          <Text style={{ textTransform: "capitalize", fontWeight: "bold" }}>
            {data.name}
          </Text>
          ?
        </Text>
        <Row style={{ width: "100%" }}>
          <FormButton
            style={{ flex: 1, marginLeft: 8, marginRight: 8 }}
            onPress={() => {
              handleUnfollow();
              slideUpRef.current.close();
              mainRef.current.close();
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Unfollow</Text>
          </FormButton>

          <FormButton
            style={{
              flex: 1,
              marginLeft: 8,
              marginRight: 8,
              backgroundColor: "#E9EBEF",
            }}
            onPress={() => {
              {
                slideUpRef.current.close();
                mainRef.current.close();
              }
            }}
          >
            <Text style={{ color: "#78849E", fontWeight: "bold" }}>Cancel</Text>
          </FormButton>
        </Row>
      </UnfollowModalContainer>
    </RBSheet>
  );
}
