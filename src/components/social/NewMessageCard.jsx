import React, { useEffect } from "react";
import { Card, Button, Divider, Checkbox } from "react-native-paper";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { getImageUrl } from "../../services/socialMedia.services";
import { useNavigation } from "@react-navigation/native";
export default function NewMessageCard(props) {
  const [tempTxt, setTempTxt] = React.useState("");
  const navigation = useNavigation();
  const [dp, setDp] = React.useState();
  const [type, setType] = React.useState(props.status);
  const userId = props._id;
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!props.dp) return;
        const res = await getImageUrl(props.dp);
        if (mounted && res.status === 0) {
          setDp(res.url);
        }
      } catch (e) {
        // ignore image load failures; placeholder will be used
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [props.dp]);
  const selectable = props.selectable === true;
  const isSelected = Boolean(props.selected);

  const handlePress = () => {
    if (selectable) {
      props.onToggle && props.onToggle(props._id);
    } else {
      navigation.navigate("ChatScreen", {
        toid: props._id,
        toName: props.fname + " " + props.lname,
      });
    }
  };

  return (
    <Card
      style={{
        marginVertical: 8,
        marginHorizontal: 12,
        shadowColor: "#00000014",
        backgroundColor: isSelected ? "#FFFDF6" : "white",
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? "#D4AF37" : "transparent",
        borderRadius: 12,
      }}
      onPress={handlePress}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={props.fname + " " + props.lname}
        subtitle={"@" + props.username}
        titleStyle={{
          fontSize: 16,
          // height: 0,
          // marginBottom: 4,
          textTransform: "capitalize",
        }}
        subtitleStyle={{ fontSize: 12, color: "#D4AF37" }}
        left={(p) => {
          return (
            <Image
              source={
                dp
                  ? { uri: dp }
                  : require("../../assets/images/general/user.png")
              }
              style={{ width: 46, height: 46, borderRadius: 6 }}
              resizeMode="contain"
            />
          );
        }}
        right={(p) =>
          selectable ? (
            <Checkbox
              status={isSelected ? "checked" : "unchecked"}
              onPress={handlePress}
              color="#D4AF37"
            />
          ) : null
        }
      />
      <Divider />
    </Card>
  );
}
