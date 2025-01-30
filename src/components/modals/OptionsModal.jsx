import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { List, Modal } from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import UnfollowModal from "./UnfollowModal";
import BlockModal from "./Blockuser";
import { useSelector } from "react-redux";
const styles = StyleSheet.create({
  overlay: {
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
export default function OptionsModal({ slideUpRef, options, data }) {
  const followRef = React.useRef(null);
  const blockRef = React.useRef(null);
  const { user, socialData } = useSelector((state) => state.user);
  const username = user?.username;
  const userid = user?._id;
  return (
    <RBSheet
      animationType="fade"
      ref={slideUpRef}
      openDuration={5000}
      closeOnDragDown={true}
      dragFromTopOnly={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,
          height: "auto",
          paddingBottom: 28,
        },
        draggableIcon: {
          backgroundColor: "#000",
        },
      }}
    >
      {options.map((option, index) => (
        <View key={index}>
          <List.Item
            key={index}
            titleStyle={option.titleStyle}
            onPress={() => {
              // slideUpRef.current.close();
              option.title !== "Report"
                ? data !== undefined
                  ? option.function(data.id, data.name)
                  : option.function()
                : option.function();
            }}
            title={option.title}
          />
          {option.title === "Unfollow" && (
            <UnfollowModal
              slideUpRef={option.followReff}
              data={data}
              mainRef={slideUpRef}
              img={
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZSUyMGltYWdlc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
              }
              name="Mrinal Rajput"
            />
          )}
          {option.title === "Block User" && (
            <BlockModal
              slideUpRef={option.blockReff}
              data={data}
              mainRef={slideUpRef}
            />
          )}
        </View>
      ))}
    </RBSheet>
  );
}
