import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { ShareModalContainer } from "../../styles/social.styles";
import RBSheet from "react-native-raw-bottom-sheet";
import ShareCard from "../social/ShareCard";

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

export default function TagPeople({
  slideUpRef,
  friends,
  setTaggedPeople,
  setTaggedPeopleNames,
}) {
  // Get all the checked friends Value
  const [bufferArray, setBufferArray] = useState([]);
  const [bufferArrayNames, setBufferArrayNames] = useState([]);
  useEffect(() => {
    let uniqueBufferArray = [...new Set(bufferArray)];
    let uniqueBufferArrayNames = [...new Set(bufferArrayNames)];

    setTaggedPeopleNames(uniqueBufferArrayNames);
    setTaggedPeople(uniqueBufferArray);
  }, [bufferArray]);
  // Set the arayy

  return (
    <RBSheet
      ref={slideUpRef}
      openDuration={250}
      height={550}
      closeOnDragDown={true}
      dragFromTopOnly={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,
        },
        draggableIcon: {
          backgroundColor: "#000",
        },
      }}
    >
      <ShareModalContainer style={styles.container}>
        <Text
          style={{
            fontWeight: "normal",
            fontSize: 20,
            color: "#454F63",
            marginBottom: 8,
          }}
        >
          Tag Your Friends
        </Text>
        {/* <Row style={{ alignItems: 'center', marginTop: 16 }}>
                    <SearchField style={{ marginTop: 0 }} placeholder="Search your friends" />
                    <View style={{ position: 'absolute', right: '5%', elevation: 3 }}>
                        <TouchableOpacity>
                            <Icon name="magnify" size={24} />
                        </TouchableOpacity>
                    </View>
                </Row> */}
        <ScrollView
          style={{ margin: 0, padding: 0, marginBottom: 48, height: 330 }}
          showsVerticalScrollIndicator={false}
        >
          {friends?.map((item, index) => (
            <ShareCard
              {...item}
              setBufferArray={setBufferArray}
              bufferArray={bufferArray}
              setBufferArrayNames={setBufferArrayNames}
              bufferArrayNames={bufferArrayNames}
              // setTaggedPeople={setTaggedPeople}
              key={index}
            />
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={() => {
            slideUpRef.current.close();
          }}
          style={{
            backgroundColor: "#D4AF37",
            padding: 15,
            borderRadius: 8,
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Done
          </Text>
        </TouchableOpacity>
      </ShareModalContainer>
    </RBSheet>
  );
}
